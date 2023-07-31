# css 问答

## transition 动画

```code
div{
    width:100px;
    height:100px;
    background:blue;
    transition:width 2s;
}

div:hover
{
   width:300px;
}

```

## animation 动画

| animation: | myFirst  | 5s       | linear   | 2s       | infinite | alternate        |
| :--------- | :------- | :------- | :------- | :------- | :------- | :--------------- |
|            | 动画名字 | 花费时间 | 速度曲线 | 何时开始 | 播放次数 | 下一周期逆向播放 |

```code
div
{
     animation: myFirst 5s linear 2s infinite alternate；
}

@keyframes myFirst
{
     0%   {background: red; left:0px; }
     50%  {background: blue; left:200px; }
     100% {background: red; left:0px; }
}

```
