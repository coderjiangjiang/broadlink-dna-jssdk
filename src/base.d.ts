declare interface Window{
    cordova:{
        exec:(...argu:any[])=>void
    },
    PROFILE:any,
    [name:string]:any
}