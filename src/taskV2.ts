import { dnaControl, deviceInfoPromise } from './call-native.js';
import { split, combine, isFunction } from './utils.js';
import moment, { Moment, Duration } from 'moment';
import { CmdOriginType, Command, QueryList } from './types.js'
/*
        新版定时API

        //普通定时（延时）、周期定时
        {
            “type” : “xx”,            //定时类型
            “class” : “xx”,           //所属类，可选，如果为空则当一般定时任务处理
            “id” : xx, 			//定时索引（由固件统一管理，添加的时候设为0或者为空）
            “en” : xx,  		//定时使能：0 - 关闭，1 - 打开
            “name” : “xx” ,         //定时名称
            “time” : “xx”,  		//时间定义（参考时间格式）
            “cmd” : “xx”,            //执行命令base64表示（考虑到二进制透传命令）
        },
        //循环（防盗）定时
        {
            “type” : “xx”,
            “class” : “xx”,           //所属类，可选，如果为空则当一般定时任务处理
            “id” : xx,
            “en” : xx,
            “name” : “xx” ,
            “stime” : “xx”,  	//开始时间（参考时间格式）
            “etime” : “xx”, 	//结束时间（参考时间格式）
            “time1” : xx,		//循环定时动作1保持时间（单位：秒）或者随机定时保持时间最小值
            “time2” : xx,		//循环定时动作2保持时间（单位：秒）或者随机定时保持时间最大值
            “cmd1” : “xx”,          //执行命令1 base64表示
            “cmd2” : “xx”,		//执行命令2 base64表示
        },

        action（act）定义
            值	含义
            0	添加
            1	删除
            2	编辑
            3	获取定时列表
            4	开启或者禁用定时
            5	获取定时限制信息
            6	配置日出日落信息

        type定义
            值	含义
            comm	普通定时
            delay	延时
            period	周期
            cycle	循环
            rand	防盗
            sleep	睡眠曲线
            all	所有定时

         为了便于调用与解析，现将原始数据做如下转换(使用Timer对象表示):
             1.time/stime/etime为自定义的Time实例，具体请看下面的Time类
             2.cmd/cmd1/cmd2参数都是plain object ,如：{pwr:1}
             3.did参数可以省略
             4.act参数会被忽略（传了也没用）
             5.en可以为O/1,或者true/false
             6.time1/time2  为moment.duration对象


         注意：call接口为对底层API的简要封装，除了补充did信息（只在参数中没有did的情况下补充），
               不做任何其他数据格式上的转换。

    * */

const ACT_ADD = 0,
  ACT_DELETE = 1,
  ACT_EDIT = 2,
  ACT_LIST = 3,
  ACT_SWITCH = 4,
  ACT_LIMITATION = 5,
  ACT_SUN_SETTING = 6;

const TYPE_COMMON = 'comm',
  TYPE_DELAY = 'delay',
  TYPE_PERIOD = 'period',
  TYPE_CYCLE = 'cycle',
  TYPE_RAND = 'rand',
  TYPE_ALL = 'all',
  BEFORE_SUN_SET = 'D-',
  BEFORE_SUN_RISE = 'U-',
  AFTER_SUN_SET = 'D+',
  AFTER_SUN_RISE = 'U+';

const _simpleClone = (obj: any) => {
  if (!obj || 'object' != typeof obj) {
    return obj;
  }

  const copy = Object.keys(obj).reduce((copy: any, field) => {
    const val = obj[field];
    let copyVal;
    if (Array.isArray(val)) {
      copyVal = [...val];
    } else if ('object' === typeof val) {
      if (val && val.clone && isFunction(val.clone)) {
        //如果对象本身提供了clone方法
        copyVal = val.clone();
      } else {
        copyVal = _simpleClone(val);
      }
    } else {
      copyVal = val;
    }
    copy[field] = copyVal;
    return copy;
  }, {});

  return Object.setPrototypeOf(copy, Object.getPrototypeOf(obj));
};

class Time {
  //日出后/日出前/日落前/日落后
  //'U+/U-/D+/D-'
  sun!: string;
  //[日出|日落][前|后]时长
  //moment.duration对象
  duration!: Duration;
  //任务的周期，0-6 分别表示每周日到每周六
  //数组，如[1,2,3]
  repeat!: number[];
  //moment对象，表示日期或者时间
  moment!: Moment;
  str!: string;

  constructor(str?: string) {
    if (str) {
      this.parse(str);
    } else {
      this.moment = moment().startOf('minute').add(1, 'minutes');
    }
  }

  isRepeated() {
    return this.repeat && this.repeat.length > 0;
  }

  parse(str: string) {
    this.str = str;
    if (
      str.startsWith(BEFORE_SUN_SET) ||
      str.startsWith(BEFORE_SUN_RISE) ||
      str.startsWith(AFTER_SUN_SET) ||
      str.startsWith(AFTER_SUN_RISE)
    ) {
      //当前为日出日落定时
      this.sun = str.substr(0, AFTER_SUN_RISE.length);
      let timeArr = str.substr(AFTER_SUN_RISE.length).split('_');
      if (timeArr[6] === '*') {
        // year字段为*，表示周期定时
        //eg:U+ 0_30_0_*_*_0,1,3,5_*
        //todo 复用
        let repeatStr = timeArr[5];
        this.repeat =
          repeatStr === '*'
            ? [0, 1, 2, 3, 4, 5, 6]
            : repeatStr.split(',').map((i) => parseInt(i));
      } else {
        // year字段有值，单次定时
        //eg:U+ 0_30_0_26_2_*_2018
        this.moment = moment(timeArr.slice(3).join('_'), 'DD_MM_*_YYYY');
      }
      this.duration = moment.duration({
        seconds: parseInt(timeArr[0]),
        minutes: parseInt(timeArr[1]),
        hours: parseInt(timeArr[2]),
      });
    } else {
      //非日出日落定时
      let timeArr = str.split('_');
      if (timeArr[6] === '*') {
        // year字段为*，表示周期定时
        //eg:0_1_22_*_*_0,1,3,5_*
        //todo 复用
        this.repeat =
          timeArr[5] === '*'
            ? [0, 1, 2, 3, 4, 5, 6]
            : timeArr[5].split(',').map((i) => parseInt(i));
        this.moment = moment(timeArr.slice(0, 3).join('_'), 'ss_mm_HH');
      } else {
        // year字段有值，单次定时
        //eg:0_1_22_26_2_*_2018
        this.moment = moment(str, 'ss_mm_HH_DD_MM_*_YYYY');
      }
    }
  }

  clone() {
    return _simpleClone(this);
  }

  toString() {
    const { sun, duration, moment, repeat } = this;
    if (sun) {
      //sun不为空，需要从duration中解析出 秒_分_时
      //注意：这里的‘秒_分_时 ’指时长，不是时刻
      const sunPart = `${sun}${(duration as Duration).seconds()}_${(duration as Duration).minutes()}_${Math.floor(
        (duration as Duration).asHours()
      )}`;
      if (repeat && repeat.length > 0) {
        //repeat不为空，表示周期定时。则无需moment值（不需要日期信息）
        //返回格式：sun_duration_*_*_repeat_*
        //如：'U- 0_30_0_*_*_0,1,3,5_*'
        return `${sunPart}_*_*_${repeat.join(',')}_*`;
      } else {
        //repeat为空，表示单次执行
        //需要从moment值中解析出日期信息 年/月/日
        //返回格式：sun_duration_日_月_*_年
        //如：'U- 0_30_0_11_12_*_2018'
        return `${sunPart}_${(moment as Moment).format('DD_MM_*_YYYY')}`;
      }
    } else {
      //sun空，则无需duration值
      if (repeat && repeat.length > 0) {
        //repeat不为空，表示周期定时
        //需要从moment中解析出 秒_分_时 （不需要日期信息）
        //注意：这里的‘秒_分_时 ’指时刻
        //返回格式：秒_分_时_*_*_repeat_*
        //如：'0_1_22_*_*_0,1,3,5_*'
        return `${(moment as Moment).format('ss_mm_HH')}_*_*_${repeat.join(',')}_*`;
      } else {
        //repeat为空，表示单次执行
        //需要从moment值中解析出日期与时刻的信息 年-月-日-时-分-秒
        //返回格式：秒_分_时_日_月_*_年
        //如：'0_1_22_26_2_*_2018'
        return (moment as Moment).format('ss_mm_HH_DD_MM_*_YYYY');
      }
    }
  }
}

export class Timer {
  type;
  id!: any;
  en;
  name;
  cmd;
  time!: Time;
  stime!: Time;
  etime!: Time;
  time1!: Duration;
  time2!: Duration;
  constructor(task: object | string) {
    if (typeof task === 'object') {
      Object.assign(this, task);

      this._override<CmdOriginType>((cmd) => combine(cmd), 'cmd', 'cmd1', 'cmd2')
        ._override<string>((time) => new Time(time), 'time', 'stime', 'etime')
        ._override<number>((en) => !!en, 'en')
        ._override<Duration>(
          (duration) => moment.duration(duration, 'seconds'),
          'time1',
          'time2'
        );
    } else if (typeof task === 'string') {
      this.type = task;
      this.cmd = {};
      this.en = true;
      this.name = 'anonymous' + Math.floor(Math.random() * 100);
      if (TYPE_COMMON === task || TYPE_DELAY === task) {
        this.time = new Time();
      } else if (TYPE_PERIOD === task) {
        this.time = new Time();
        this.time.repeat = [0, 1, 2, 3, 4, 5, 6];
      } else if (TYPE_RAND === task || TYPE_CYCLE === task) {
        this.stime = new Time();
        this.etime = new Time();
        this.etime.moment.add(2, 'hours');
        this.time1 = moment.duration(1, 'minutes');
        this.time2 = moment.duration(1, 'minutes');
      }
    }
  }

  setRepeat(repeat: number[]) {
    if (this.type === TYPE_RAND || this.type === TYPE_CYCLE) {
      this.stime.repeat = repeat;
      this.etime.repeat = repeat;
    } else {
      this.time.repeat = repeat;
    }
  }

  getRepeat() {
    if (this.type === TYPE_RAND || this.type === TYPE_CYCLE) {
      return this.stime.repeat;
    } else {
      return this.time.repeat;
    }
  }

  isRepeated() {
    if (this.type === TYPE_RAND || this.type === TYPE_CYCLE) {
      return this.stime.isRepeated() && this.etime.isRepeated();
    } else {
      return this.time.isRepeated();
    }
  }

  _override<T>(fn: (argu: T) => any, ...fields: string[]) {
    fields.forEach((field: string) => {
      if ((<any>this)[field] != null) {
        (<any>this)[field] = fn((<any>this)[field]);
      }
    });
    return this;
  }

  clone() {
    return _simpleClone(this);
  }

  toOriginal() {
    const reps = Object.assign({}, this);
    const override = this._override.bind(reps);
    override<Command>((cmd) => split(cmd), 'cmd', 'cmd1', 'cmd2');
    override<Time>((time) => time.toString(), 'time', 'stime', 'etime');
    override<boolean>((en) => (en ? 1 : 0), 'en');
    override<Duration>((duration) => duration.asSeconds(), 'time1', 'time2');
    return reps;
  }
}

const call = async <T>(request: T) => {
  const device = await deviceInfoPromise;
  if (!('did' in request)) {
    request = { ...request, did: device.subDeviceID || device.deviceID };
  }
  const resp: any = await dnaControl(request, 'dev_subdev_timer');
  return resp.data;
};

/*
 * 参数可以为object或者array
 * object 即是<DNA协议规范3.1.53>中定义的数据结构，但timerlist中为Timer实例
 * array  只有Timer实例列表
 * */
interface Rqs { timerlist: Timer[], did?: string, act?: number };
const add = function (...tasks: Timer[] | [Rqs]) {
  let rqs: Rqs = { timerlist: [] };

  if (tasks.length === 1 && (tasks[0] as Rqs).timerlist) {
    //传入的参数是固件需要的完成数据
    let { did, timerlist } = tasks[0] as Rqs;
    rqs = { did, timerlist };
  } else {
    //传入的参数是定时列表
    rqs = { timerlist: tasks as Timer[] };
  }
  //默认为添加操作
  rqs.act = ACT_ADD;

  rqs.timerlist = rqs.timerlist.map((t) => {
    if (t.id >= 0) {
      //id有值就是修改定时
      rqs.act = ACT_EDIT;
    }
    return t.toOriginal();
  });

  return call(rqs);
};

const list = async function ({
  type = TYPE_ALL,
  count = 10,
  index = 0,
  did,
}: QueryList = {} as QueryList) {
  const resp = await call({
    did,
    act: ACT_LIST,
    type,
    count,
    index,
  });
  resp.timerlist = resp.timerlist.map((t: object) => new Timer(t));
  return resp;
};

/*
 * 参数可以为object或者array
 * object 即是<DNA协议规范3.1.53>中定义的数据结构，但timerlist中可以为Timer实例也以为plain object
 * array  只有定时列表，可以为Timer实例也以为plain object
 * */
const del = function (...tasks: Timer[] | [Rqs]) {
  let rqs: Rqs;

  if (tasks.length === 1 && (tasks[0] as Rqs).timerlist) {
    let { did, timerlist } = tasks[0] as Rqs;
    rqs = { did, timerlist };
  } else {
    //传入的参数是定时列表
    rqs = { timerlist: tasks as Timer[] };
  }
  rqs.act = ACT_DELETE;
  (rqs.timerlist as any) = rqs.timerlist.map((t) => {
    const { type, id } = t;
    return { type, id };
  });

  return call(rqs);
};

const sunSetting = function (setting: any) {
  return call({ ...setting, act: ACT_SUN_SETTING });
};

const getLimitation = function ({ type }: any = {}) {
  return call({ type, act: ACT_LIMITATION });
};

const taskV2 = {
  add,
  list,
  del,
  sunSetting,
  getLimitation,
  call,
  Timer,
  TYPE_COMMON,
  TYPE_DELAY,
  TYPE_PERIOD,
  TYPE_CYCLE,
  TYPE_RAND,
  TYPE_ALL,

  BEFORE_SUN_SET,
  BEFORE_SUN_RISE,
  AFTER_SUN_SET,
  AFTER_SUN_RISE,
};
export default taskV2;
