export function delay(times: number): Promise<void>{
    return new Promise<void>((resolve, reject)=>{setTimeout(()=>resolve(), times)});
}
