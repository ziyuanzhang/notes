## 安装

1. ts-node-dev
2. tsconfig.json

```
写要求
{
    "compilerOptions":{

        "lib":["ES6","DOM"],//支持书写的的东西;（console.log--属于DOM，TS默认不支持DOM，添加上）
        "target":["ES6"],//生成的东西
        "noTmplicitAny":true, //禁止使用Any
        "strict":true, //开启严格模式检查
        "noTmplicitThis":true, // 禁止使用this
        "strictNullChecks":true, //禁止使用null
    }
}

```

| ES6 基础数据类型 | TS 基础数据类型 |
| :--------------- | :-------------: |
| Boolean          |      Vioid      |
| Number           |       Any       |
| Array            |      元组       |
| Function         |      枚举       |
| Object           |    高级类型     |
| Symbol           |                 |
| undefined        |                 |
| null             |                 |

**注：** TS 类型都是小写；例如（let num:number =10）number 小写

#### Utility Types： 工具类

1. typeof：获取变量类型；
2. keyof：将类型的键联合起来；type P = "x" | "y"；
3. in: 用来遍历枚举类型;
4. as: 类型断言 -- 针对联合类型；
5. &:交叉类型（Intersection types）
6. |：联合类型（Union types）
7. 泛型:
8. extends: 继承，`function longest<Type extends { length: number }>(a: Type, b: Type) {}`
9. Partial<Type>: 把类型 Type 的所有属性设置为可选；
10. Required<Type>: 把类型 Type 的所有属性设置为必选；
11. Readonly<Type>: 把类型 Type 的所有属性设置为只读，不能重新赋值；【与 js 的冻结类似--Object.freeze】
12. Record<Keys, Type>: 构造一个对象类型，其属性键为 Keys，其属性值为 Type。
13. Pick<Type, Keys>: 从 Type 中选取一组属性 Keys 来构造一个类型。
    `type TodoPreview = Pick<Todo, "title" | "completed">;`
14. Omit<Type, Keys>: 从 Type 中 删除属性 Keys 来构造一个类型。
    `type TodoInfo = Omit<Todo, "completed" | "createdAt">`
15. Exclude<UnionType, ExcludedMembers>: 从 UnionType 中 排除 ExcludedMembers 来构造一个类型
    `type T1 = Exclude<"a" | "b" | "c", "a" | "b">; type T1 = "c"`
16. Extract<Type, Union> 取 Type 和 Union 共有的属性来构造一个类型
    `type T0 = Extract<"a" | "b" | "c", "a" | "f">; type T0 = "a"`

17. NonNullable<Type>: 通过从 Type 中排除 null 和 undefined 来构造一个类型。
    `type T0 = NonNullable<string | number | undefined>;type T0 = string | number`

18. 元组: `let tuple:[number,string,boolean]=[1,'测试',true]`

19. 枚举

```
enum Days{
    Sun = 7,
    Mon = 1,
    Tue = 2,
    Wed = 3,
    Thu = 4,
    Fri = 5,
    Sat = 6,
}
console.log("aaa:",Days["Sun"])
console.log("aaa:",Days[7])
```

13. 函数

        1、

        ```
        let myFn:(x:number,y:number) =>number = function(x:number,y:number):number{
            return x+y
        }
        注：
        (x:number,y:number) =>number  -->为类型
        let myFn = function(x:number,y:number):number{
            return x+y
        }

        ```

        2、可选参数

        ```
        function build(fistName:strign,lastName?:string){

        }
        ```

        3、函数表现形式

        ```
        3.1 {} ：-->表示函数，和ES6中的代码模块冲突（不要用）
        3.2 ()=>{}  ：-->表示函数
        ```

14. 类

        1. 抽象类、类中的抽象方法（abstract）-->需要具体实现，不能直接用;
        2. 方法修饰符：

           - public：共有的，任何地方都能用
           - protected：继承的，只有子类中能用
           - private：私有的，只有当前类能用（子类中也不能用）

        3. 类中 private 与# 的区别：编译后的实现方式不一样

        ```
        abstract class Animal{    //定义抽象类
            abstract sound():viod;  //定义抽象方法
            protected move():viod{
                console.log("移动");
            }
        }
        class Dog extends Animal{
            #region:string;   //ES6的写法，私有的
            constructor(){
               super();
               this.#region="ceshi 私有"；
            }
            private uname:string="siyou";
            sound(){         // 抽象方法 -- 必须实现
                console.log("叫叫")
            }
        }
        ```

#### 接口

```
interface Person{
    readonly id:number; //只读（可以赋值，不能改）
    name:string,
    age:number,
    [proName:string]:number //1.可以添加一个key为string类型的属性；2.Person的所有属性值必须为number型（因此一般number用any替换）
}
```

interface 与 type 相同点：

- 都可以声明一个对象或函数
- 都允许进行扩展

interface 与 type 不同点：

- type:声明基本类型别名、联合类型、元祖等
- typeof：获取实例的对象
- interface 可以被合并

#### 接口实现

1.基本实现（前端--后台接口）

```
interface IPrice{
    id:number;
    msg:string;
}
type IPriceArr =IPrice[]
```

2.类实现接口（nodejs）

```
interface IClock{
    tick():void;
}
class DigitalClock implements IClock{
    public tick():void{
        console.log("--beep--")
    }
}
```

#### 类型确定

1、用 as const； 转换类型（固定类型）

```
function useFetch(){
    const response : string="hahha"
    const age : number=30;
    return [response,age] as const; // 确定类型
}
const [response] = useFetch;
```

2、用泛型

```
function useFetch(){
    const response : string="hahha"
    const age : number=30;
    return tuplify(response,age) // 确定类型
}
//-------tuplify 泛型，先继承数组（unknown -- 数组类型不知道）
function tuplify<T extends unknown[]>(...elements:T):T{
   return elements
}
const [response] = useFetch;
```

#### 装饰器 -- 元编程

Parameters 特性
