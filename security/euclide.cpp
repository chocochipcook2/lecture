int GCD(int a, int b){
    int tmp=2;
    while(1){
        if (a<b) swap(a,b);
        if(a%b==0) return b;
        else{
            tmp =a%b;
            a=b;
            b=tmp;

        }
    }
    return -1
}