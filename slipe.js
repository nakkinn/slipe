let s,topx,topy,col,row,c1,c2,r1,r2;
let board=new Array(5);
for(let i=0;i<5;i++)    board[i]=new Array(5);
let peer,room;

function setup(){
    createCanvas(windowWidth,windowHeight);

    peer=new Peer({
        key: 'cf1155ef-ab9f-41a3-bd4a-b99c30cc0663',
        debug:1
    });

    peer.on('open',()=>{
        id=peer.id;
        room=peer.joinRoom("room",{
            mode:'sfu'
        });
        room.on('open',()=>{
        });
        room.on('peerJoin',peerId=>{
            console.log(peerId+"参加");
        });
        room.on('peerLeave',peerId=>{
            console.log(peerId+"退出");
        });
        room.on('data',message=>{
            console.log(message.data);
            receive(message.data);
        });
    });

    rectMode(CENTER);
    s=min(width,height)/5;
    if(width>height){
        topx=(width-height)/2;
        topy=0;
    }else{
        topx=0;
        topy=(height-width)/2;
    }

    reset();

}

function draw(){
    background(255);

    noStroke();
    for(let i=0;i<5;i++)    for(let j=0;j<5;j++){
        fill(200);
        if((i==c1&&j==r1)||(i==c2&&j==r2)){
            rect(topx+s*(i+0.5),topy+s*(j+0.5),s)
        }
    }

    stroke(0);
    for(let i=0;i<6;i++){
      line(topx,topy+s*i,topx+5*s,topy+s*i);
      line(topx+s*i,topy,topx+s*i,topy+5*s);
    }

    noStroke();
    fill(100);
    triangle(topx+2*s,topy+2*s,topx+2*s+s*0.2,topy+2*s,topx+2*s,topy+2*s+s*0.2);
    triangle(topx+3*s,topy+2*s,topx+3*s-s*0.2,topy+2*s,topx+3*s,topy+2*s+s*0.2);
    triangle(topx+2*s,topy+3*s,topx+2*s+s*0.2,topy+3*s,topx+2*s,topy+3*s-s*0.2);
    triangle(topx+3*s,topy+3*s,topx+3*s-s*0.2,topy+3*s,topx+3*s,topy+3*s-s*0.2);


    for(let i=0;i<5;i++)    for(let j=0;j<5;j++){
        if(board[i][j]==4){
            noFill();
            stroke('#4444ff');
            strokeWeight(5);
            rect(topx+i*s+0.5*s,topy+j*s+0.5*s,s*0.8);
            strokeWeight(1);
        }
        if(board[i][j]<4){
            let color;
            if(board[i][j]<2)   color='#e9bb71';
            else    color='#6b522a';
            fill(color);
            stroke(0);
            strokeWeight(3);
            rect(topx+i*s+0.5*s,topy+j*s+0.5*s,s*0.8,s*0.8,s*0.1);
            if(board[i][j]%2==1){
                fill(0);
                noStroke();
                rect(topx+i*s+0.5*s,topy+j*s+0.5*s,s*0.5);
                fill(color);
                rect(topx+i*s+0.5*s,topy+j*s+0.5*s,s*0.4);
                fill(0);
                rect(topx+i*s+0.5*s,topy+j*s+0.5*s,s*0.3);
            }
            strokeWeight(1);
        }
    }
}

function mouseClicked(){
    let c=(mouseX-topx)/s,r=(mouseY-topy)/s;

    let flag=true;
    if(c>=0&&c<5&&r>=0&&r<5){
        c=int(c),r=int(r);
        if(board[c][r]<4){
            col=c,row=r;
            enable(c,r);
            flag=false;
        }
        if(board[c][r]==4){
            board[c][r]=board[col][row];
            board[col][row]=undefined;
            room.send(col+','+row+','+c+','+r);
            c1=col,r1=row,c2=c,r2=r;
        }
    }
    if(flag)    for(let i=0;i<5;i++)    for(let j=0;j<5;j++)    if(board[i][j]==4)  board[i][j]=undefined;
}

function enable(c,r){
    let dir=[[0,-1],[1,0],[0,1],[-1,0]];
    for(let i=0;i<5;i++)    for(let j=0;j<5;j++)    if(board[i][j]==4)  board[i][j]=undefined;
    for(let k=0;k<4;k++){
        let flag=false;
        for(let i=1;i<6;i++){
            if(ins(c+dir[k][0]*i,r+dir[k][1]*i)){
                if(board[c+dir[k][0]*i][r+dir[k][1]*i]!=undefined){
                    flag=true;
                }
            }else   flag=true;
            if(flag){
                if(i!=1&&(c+dir[k][0]*(i-1)!=2||r+dir[k][1]*(i-1)!=2||board[c][r]%2==1)){
                    board[c+dir[k][0]*(i-1)][r+dir[k][1]*(i-1)]=4;
                }
                break;
            }
        }
    }
}

function ins(c,r){
    if(c>=0&&c<5&&r>=0&&r<5)    return true;
    else    return false;
}

function receive(msg){
    if(msg=="reset"){
        reset();
    }else{
        msg=msg.split(',');
        for(let i=0;i<4;i++)    msg[i]=4-int(msg[i]);
        board[msg[2]][msg[3]]=board[msg[0]][msg[1]];
        board[msg[0]][msg[1]]=undefined;
        c1=msg[0],r1=msg[1],c2=msg[2],r2=msg[3];
    }
}

function keyPressed(){
    if(key=='r'){
        reset();
        room.send("reset");
    }
}

function reset(){
    for(let i=0;i<5;i++)    for(let j=0;j<5;j++)    board[i][j]=undefined;
    for(let i=0;i<5;i++)    board[i][4]=0;
    board[2][4]=1;
    for(let i=0;i<5;i++)    board[i][0]=2;
    board[2][0]=3;
    c1=c2=r1=r2=-1;
}