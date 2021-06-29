class block{
    constructor(index,hash,prvhash,time,data,dif,nonce){
        this.index=index;
        this.hash=hash;
        this.prvhash=prvhash;
        this.time=time;
        this.data=data;
        this.dif=dif;
        this.nonce=nonce;
    }
}
const pullTime=()=>Math.round(new Date().getTime()/1000);
const makeHash = (index, prvhash, time, data, diff, nonce) =>
암호화.SHA256(
index + prvhash + time + JSON.stringify(data) + diff + nonce
).toString();

