# java

1. mvc 模式: 对象回调

2. 并发：就是“同时”

## 项目--模块--包--类

## 1、====基础类型转换==================

## 整数相除，只得整数部分；只要其中一个为小数，就可得“完整的运算结果”

## 小数相加，结果不精确（在计算机中“整数和小数”存储方式不同导致的）

## char 类型可以与数字相加减；底层逻辑执行的是 字母、符号（a）对应的 ASCII 码的数字加减【网站登录验证码】

## 类型转换：String s = (String) rs

## 类型默认值

- 基本类型：

  1. byte、short、char、int、long : 0
  2. float、double : 0
  3. boolean : false

- 引用类型：类、接口、数组、String : null

## 数组 -- 连续存储; 寻址较快，增删较慢（把后面数据位置进行移动 -- 扩容、缩减）

`String[] arr = new String[3];`

1. 数组查询：通过“虚拟基址”和索引定位，查询任意数据耗时相同；
2. 零基索引(索引从 0 开始)：`元素地址 = 虚拟基址 + 偏移量(单位制 * 索引)`();
3. 一基索引(索引从 1 开始)：`元素地址 = 虚拟基址 + (偏移量 - 1)`，多一次减法操作
4. `偏移量 = 单位制 * 索引`

**注：**

- 栈内存存储的是对象地址，堆内存存储的是对象

  1. 当数组被创建时，JVM 就知道它的起始地址（虚拟基址）
  2. 这个基址保存在栈上的数组引用变量中
  3. 我们不需要"找"基址，它已经在那里了

- 虚拟地址 vs 物理地址

  ```java
  // 物理内存可能是碎片化的：
  物理内存: [空闲][进程A][空闲][进程B][空闲]

  // 但JVM看到的是连续的：
  虚拟内存: [0x0000-0xFFFF] 连续空间
  ```

- 实际内存访问流程

  1. Java 层：array 引用包含虚拟地址；
  2. JVM 层：计算 虚拟基址 + 偏移量；
  3. 系统调用：JVM 通过系统 API 访问该虚拟地址；
  4. MMU 转换：硬件将 虚拟地址 转换为 物理地址 ；
  5. 内存控制器：访问实际的 RAM 位置；
  6. 数据返回：值沿原路返回到 Java 程序；

## 链表：查询慢、增删相对快

## 对象（数据结构）：本质上是一种特殊的数据结构（可以理解成一张表）

1. java 在 “JVM 虚拟机”上运行，“JVM 虚拟机”在“内存”中运行（java 程序在`内存中的 JVM 虚拟机`上运行）
2. “JVM 虚拟机” 为了更好的运行程序，把内存分为`栈内存、堆内存、方法区`来配合执行 java 程序；

   - 栈内存：存执行方法；

     1. 方法中的每个变量存"堆内存"中对应对象的地址;

   - 堆内存：存 new 出来的对象 和 静态变量；

     1. 对象中有 1 个“类地址”，它指向“方法区”中该对象的创建类地址；

   - 方法区：存类；
   - 调用对象中的方法：栈内存变量--》堆内存对象--》方法区类--》添加到栈内存：执行
     `s=new Student(); s.name="liSi";s.read()`

## 2、====面向对象编程的三大特征：封装、继承、多态===========

## 类

1. 构造器：1、没有返回值，2、方法名必须和类型相同

   - 构造器可以重载(重载：多个同名函数，但参数不同)
   - 创建对象时，“类 new 的对象”会自动调用构造器
   - 类默认自带一个无参数构造器；如果写了有参构造器，默认的无参构造器就失效，还想用无参构造器，需要再手写一个；

2. this 关键字：this 就是一个变量，可以在方法中，来拿到当前对象

   - this 主要用来解决：变量名冲突的问题

3. 封装：

   - 面向对象的三大特征：封装、继承、多态
   - 类就是一种封装，方法也是一种封装
   - private(私有)：只能在本类中使用；

     ```java
     public class Student{
        private int age;
        public void setAge (int age){
          this.age = age; //this 区分用的
        }
        public int getAge(){
          return age; //私有变量可以“在本类”中直接用
        }
     }
     ```

4. javabean（实体类）：是一种特殊类；

   - 需要满足以下 2 点：

     1. 类中的成员变量全部私有，并提供 public 修饰的 getter/setter 方法
     2. 类中需提供一个无参数的构造器，有参数的构造器可选

        **注：** 不涉及业务

   - 实际作用：创建对象，存取数据（封装数据）

## static（静态）： 关键字，可以修饰成员变量、成员方法

1. 成员变量：按照有无 static 修饰，分为 2 中：

   - 静态变量（类变量）：有 static 修饰，属于类的；在计算机里只有 1 份，`会被类的全部对象共享`；

     **注：** 可以改变值，不是常量，只是标记为类变量，

   - 实例变量（对象变量）：无 static 修饰，`属于每个对象的`；

     ```java
     public class Student{
       static String name;
       int age;
     }
     // 类名.静态变量（推荐）
     // 对象.静态变量（不推荐）
     //
     // 对象.实例变量
     // 自己类中 访问类变量可以省略类名
     ```

2. 成员方法：按照有无 static 修饰，分为 2 中：

   - 静态方法：有 static 修饰，属于类。
   - 实例方法：无 static 修饰，

     ```java
        public class Student{
          public static void printHW(){
            System.out println("Hello Word")
          }
        }
        // 类名。静态方法（推荐）
        // 对象名。静态方法（不推荐）
        //
        // 对象。实例方法
        //只是为了做一个功能，且不需要访问对象的数据，就定义静态方法
        //对象的行为，且要访问对象的数据，定义为实力方法；
        //在自己类中，访问类方法可以省略类名；
     ```

### 静态方法：常见应用场景--做工具类

工具类没有创建对象的需求，建议将工具类的构造器方法进行私有化（好处，私有化后，强制用户不能实例化，减少实例化的内存占用）

### 静态方法/实例方法：注意事项

- 静态方法中：可直接访问静态成员，不可直接访问实例成员
- 实例方法中：可直接访问静态成员，也可直接访问实例成员
- 静态方法中不可出现 this 关键字，实例方法中可出现 this 关键字；

```java
    public class test{
       public static int count =100;
       public static void printAA(){
         System.out.println("AA")
       }

       private String name;
       public void run(){}

       public static void main(String[] args){}
       // 静态方法中：可直接访问静态成员，不可直接访问实例成员
       public static void printHW(){
         System.out.println(count)
         printAA()
         System.out.println(name) //---报错
         System.out.println(this);//--报错
       }
       // 实例方法中：可直接访问静态成员，也可直接访问实例成员
       public void go(){
         System.out.println(count)
         printAA();
         System.out.println(name)
         run();
         System.out.println(this);
       }
    }

```

## 继承（extends）: 父类（基类、超类），子类（派生类）

子类能继承父类的非私有成员（成员变量、成员方法）

1. 权限修饰符：

   - private：只能本类
   - 缺省：本类、同一个包中的类
   - protected：本类、同一个包中的类、子孙类中
   - public：任意位置

     **注：** private < 缺省 < protected < public

2. 跨包需要导入类
3. 继承特点：

   - 单继承
   - 多层继承（子-父-祖父）
   - 祖宗类：Object
   - （访问）就近原则

     **注：** 可通过`super关键字`，访问父类成员：`super.父类成员变量/父类成员方法`

4. 方法重写：

   - 使用 `@Override` 注解（提示）
   - 方法名和参数一致
   - 访问权限：必须大于等于父类方法的权限
   - 返回值类型：必须小于等于父类的返回值类型
   - 私有方法、静态方法 不能被重写

   ```java
   @Override
   public void cry(){
     System.out.println("啊啊啊啊")
   }
   ```

5. 子类构造器：子类的构造函数会默认调用父类的构造器（supper()必须写在第一行）

   ```java
   class Child extends Parent{
     public Child(){ //子类构造函数
       // supper() //即使子类不写，程序也会默认调用一边
       // supper(6666)
       System.out.println("----")
     }
   }
   ```

6. 构造器中的 this：调用本类中的兄弟构造器

   **注：** “supper(...)”与“this(...)”必须写在构造器的第一行，并且两者不能同时出现

   ```java
     public class Student{
      private String nam;
      private char sex;
      private int age;
      private String schoolName;
      public Student(){} //构造器函数
      public Student(){
        this(name,sex,age,"初中")
      }
      public Student(String name, char sex,int age,String schoolName){
         this.name=name
         this.sex=sex
         this.age =age
         this.schoolName = schoolName
      }
     }
   ```

## 多态：（就是提取共同的，用共同的）

1. 多态的前提条件：1、有继承/实现关系；2、存在父类引用子类对象；3、存在方法重写；

   - 对象多态，行为多态
   - 方法：编译看左边，运行看右边；
   - 成员变量：编译看左边，运行看左边；

     **注：** 多态是对象、行为的多态，java 中的属性（成员变量）不谈多态；

   ```java
   public class Animal{
     String name="动物"
     public void run(){
       System.out.println("动物会跑。。。")
     }
   }
   public class Wolf extends Animal{
     String name="狼"
     @Override
     public void run(){
       System.out.println("狼跑的快~~~")
     }
   }
   public class Tortoise extends Animal{
     String name="乌龟"
     @Override
     public void run(){
       System.out.println("乌龟跑的慢---")
     }
   }
   public class Test{
     public static void main(String[] args){
       Animal a1 = new Wolf();
       a1.run(); //狼跑的快~~~
       System.out.println(a1.name); //动物

       Animal a2 = new Tortoise();
       a2.run(); //乌龟跑的快~~~
       System.out.println(a2.name); //动物

     }
   }

   ```

2. 多态的好处：多态形式下：右边对象是解耦合的，便于扩展和维护

3. 多态问题：不能调用子类独有的功能
4. 多态下的类型转换：

   - 自动类型转换：父类 变量名 = new 子类（）； `例：People p = new Teacher();`
   - 强制类型转换：子类 变量名=（子类）父类变量；`例：Teacher t = (Teacher)p;`

   强制类型转换的注意事项：（类似 TS 的 as）

   - 存在继承/实现关系就可以在“编辑阶段”进行强制类型转换，编译阶段不会报错
   - 运行时，如果发现对象的真实类型与“强转后的类型不同”，就会报类型转换异常（ClassCastException）的错误出来

     **注：** 使用 instanceof 判断当前对象的真实类型：`对象instanceof类型`。

## 3、====面向对象高级： final、单例类、枚举类、抽象类、接口 ==============

## final（最终）：可以修饰：类、方法、成员变量

1. 修饰类：该类是最终类，不能被继承
2. 修饰方法：该方法是最终方法，不能被重写
3. 修饰变量：该变量有且仅能被赋值一次【类似 js 中的常量关键字 const】

   - 修饰基本类型：变量存储的 ”数据“ 不能被改变；
   - 修饰引用类型：变量存储的 ”地址“ 不能被改变，但地址所指向对象的内容可以被改变；

4. 常量：使用 static final 修饰的成员变量；作用：常用于记录系统的配置信息。

   程序编译后，常量会被”宏替换“（即全部替换为字面量-真实值）

   ```java
   public class Constants {
     public static final String DB_URL = "db:mysql://localhost:3306/test";
   }
   ```

## 单例类（设计模式）：确保类对外只能创建一个实例

## 枚举类（enum）

```java
  public enum Color {RED, GREEN, BLUE}
```

## 抽象类（abstract）：--- 为了更好的支持“多态”

abstract 关键字：用来修饰”类” --》“抽象类”
abstract 关键字：用来修饰”方法“ --》“抽象方法“

- 抽象类中不一定有抽象方法，有抽象方法的类必须是抽象类；
- 类有的成员：成员变量、方法、构造器，抽象类都可以有；
- 抽象类特点：抽象类不能创建对象，仅作为一种特殊的类，让子类继承并实现；
- 一个类继承抽象类：必须重写抽象类的全部抽象方法，否则这个类也必须定义成抽象类；

```java
   修饰符 abstract class 类名 {
     修饰符 abstract 返回值类型 方法名(形参列表);
   }
```

## 模板方法（设计模式）：抽出公用的，填充不同的

## 接口（interface）

1. 接口概述

   ```java
     // (jdk8)之前接口中只能定义 “常量和抽象方法”
     public interface 接口名 {
       // 成员变量（常量）
       // 成员方法（抽象方法）
       void run()
       String go()
     }
   ```

   - 接口是用来被类"实现（implements）"的,实现接口的类称为实现类，`一个类可以同时实现多个接口`。
   - 实现类必须重写“所有接口的所有抽象方法”

   ```java
     修饰符 class 实现类类名 implements 接口1,接口2,接口3,接口4,....{  }
   ```

2. 接口好处

   ```java
      public class test{
        public static void main(String[] args){
          Person p = new Student();
          A SA =new Student();
          B SB =new Student();

          A TA = new Teacher();
          B TB = new Teacher();
        }
      }
      interface A{}
      interface B{}
      class Person{}
      class Student extends Person implements A,B{}
      class Teacher extends Person implements A,B{}
   ```

3. jdk8 开始，接口新增的 3 中方法（基本用不到）

   1. 默认方法（实例方法）：使用 default 修饰,默认会被加上 public 修饰；

      **注：** 只能使用接口的实现类对象调用

   2. 私有方法：必须用 private 修饰（jdk9 开始有）；

      **注：** 给接口内部调用

   3. 类方法（静态方法）：使用 static 修饰，默认会被加上 public 修饰；

      **注：** 只能用接口名来调用

4. 接口注意事项：

   - 接口可以多继承：1 个接口可以继承多个接口；

     1. 类与类：单继承；
     2. 类与接口：多实现；
     3. 接口与接口：多继承；

   - 1 个接口继承多个接口：如果多个接口中”方法签名“（返回值类型）冲突，则不支持多继承，也不支持多实现；

   - 1 个类继承父类，又同时实现接口：如果父类中的方法名与接口中的默认方法名冲突，实现类会优先用父类的；

     ```java
       class Dog extends Animal implements A{
         public void run(){
          show(); // 父类方法
          super.show(); //父类方法
          A.supper.show() //接口方法
         }
       }
     ```

   - 1 个类实现多个接口：如果多个接口中的”默认方法“冲突，则类中必须重写该方法；

     ```java
       class Dog implements A,B{
          @Override
          public void show(){
              A.super.show(); //调用A的show方法
              B.super.show(); //调用B的show方法
          }
       }
     ```

5. 抽象类与接口:

   - 相同点：

     1. 都是抽象形式，都可以有抽象方法，都不能创建对象。
     2. 都是派生子类形式：抽象类是被子类继承使用，接口是被实现类实现。
     3. 一个类继承抽象类或者实现接口：都必须重写完他们的抽象方法，否则自己要成为抽象类或者报错！
     4. 都能支持的多态，都能够实现解耦合。

   - 不同点：

     1. 抽象类中可以定义类的全部普通成员，接口只能定义常量，抽象方法(JDK8 新增的三种方式)
     2. 抽象类只能被类单继承，接口可以被类多实现。
     3. 一个类继承抽象类就不能再继承其他类，一个类实现了接口(还可以继承其他类或者实现其他接口)。
     4. 抽象类体现模板思想：更利于做父类，实现代码的复用性。-- 最佳实践
     5. 接口更适合做功能的解耦合：解耦合性更强更灵活。-- 最佳实践

## 4、====面向对象高级： 代码块、内部类、函数式编程、常用 api、GUI 编程 ==============

类的 5 大成分：1.成员变量、2.构造器（构造方法）、3.方法、4.代码块、5.内部类

## 代码块（不常用）

1. 静态代码块：

   - 特点：类加载时自动执行，由于类只会加载 1 次，所以静态代码块也只会执行 1 次；
   - 作用：完成类的初始化，例：对静态变量的初始化赋值

   ```java
   public class Test {
    public static String schoolName;
    public static String[] cardArr = new String[10];
    static{ // 不是必须的，main中也可以，构造器中也可以
      System.out.println("静态代码块");
      schoolName = "上海大学";
      cardArr[0] = "1234567890";
      cardArr[1] = "1234567891";
      //......
    }
    public static void main(String[] args) {}
   }
   ```

2. 实例代码块：

   - 特点：每次创建对象（实例）时，执行实例代码块，并在构建前执行；
   - 作用：和构造器一样，都是用来完成对象的初始化，例：对实例变量的初始化赋值

   ```java
   public class Test {
     private String name;
     private String[] direction = new String[10];
     {
      System.out.println("实例代码块");
      name="张三";
      direction[0] = "上海";
      direction[1] = "北京";
      //.....
     }
     public static void main(String[] args) {}
   }
   ```

## 内部类：（不常用）一个类定义在另一个类的内部

按特点分为：成员内部类、局部内部类、静态内部类、匿名内部类

- 成员内部类：无 static 修饰的内部类

  ```java
   // 外部类名称.内部类名称 对象名 = new 外部类名称.new 内部类名称();
   Outer.Inner oi = new Outer().new Inner();
   oi.setName("sss"); // 内部类中的方法
  ```

  1. 成员内部类：可以直接访问外部类的静态成员，也可以直接访问外部类的实例成员（通过 new Outer()对象）；
  2. 成员内部类的实例方法中，可以直接拿到当前寄生的外部类对象（外部类名.this；通过 new Outer()对象）；

- 静态内部类：有 static 修饰的内部类

  ```java
    // 外部类名称.内部类名称 对象名 = new 外部类名称.内部类名称();
    Outer.Inner oi = new Outer.new Inner();
    oi.show(); // 静态内部类中的方法
  ```

  1. 静态内部类：只能访问外部类的静态成员，不能访问外部类的实例成员；

- 局部内部类：没毛用！！！
- 匿名内部类：所谓匿名：指的是程序员不需要为这个类声明名字，默认有一个隐藏的名字（`编译后能看到自动生成的类名`）。

  1. 特点：匿名内部类本质上就是一个子类，并会立即创建出一个子类对象
  2. 作用：更方便创建一个子类对象
  3. 抽象类和接口 都可以创建匿名内部类

  ```java
    new 类或接口 (参数值...){
      类体(一般是方法重写);
    }
    //----------
    new A(){
      @Override
      public void show(){}
    }
  ```

  ```java demo1
    // 创建一个抽象类
     public abstract class Animal {
      public abstract void cry();
     }

     // 创建一个子类
     // public class Cat extends Animal {
     //    @Override
     //    public void cry() {
     //      System.out.println("喵喵喵");
     //    }
     //}

     // 创建一个匿名内部类
     public class Test {
         public static void main(String[] args) {
              Animal a = new Animal() {
                   @Override
                   public void cry() {
                        System.out.println("喵喵喵");
                   }
              }
              a.cry();
         }
     }

  ```

  ```java demo2
  @FunctionalInterface  // 函数式接口注解(可不加，加了就会检测)
  public interface A {
    public void show();
  }
  public class Test {
    public static void main(String[] args) {
      A a = new A() {
        @Override
        public void show() {}
      }
      start(a);
      //-----------------------------
      start(new A() {
        @Override
        public void show() {}
      });
    }
    public static void start(A a) {
      a.show();
    }
  }
  ```

## 函数式编程：Lambda 表达式（jdk8 新增的）

`java 中的函数（Lambda 表达式）：（x)->2x+1`

`python 中的函数（Lambda 函数）：lambda x:2x+1`

**注：**

1. Lambda 表达式 `只能替代“函数式接口”的“匿名内部类”`；
2. 函数式接口：有且只有一个抽象方法;
3. 上下文推断：Lambda 函数式接口的参数类型和返回值类型，编译器会自动推断

简化规则：

1. 参数类型 和 返回值类型 可以省略，因为编译器会自动推断；
2. 参数列表只有一个参数时，括号可以省略；
3. Lambda 函数体只有一条语句时，大括号、return 和分号(;) 可以省略；

## 函数式编程：方法引用 （Lambda 表达式 的简化 - JDK11 新增）

```java
  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  public class Student {
    private String name;
    private int age;
    private double height;
    private String sex;
    public static int compareByAge(Student s1, Student s2) {
      return s1.getAge() - s2.getAge();
    }
    public int compareByHeight(Student s1, Student s2) {
     // return s1.getHeight() - s2.getHeight();
     return Double.compare(s1.getHeight(), s2.getHeight());
    }
  }
```

- 静态方法的引用：`类名::静态方法名`

  ```java
  public class Test {
    public static void main(String[] args) {
        test1()
        test2()
    }
    public static void test1() {
        Student[] students = new Student[10];
        students[0] = new Student("张三", 18, 1.7, "男");
        // ......
        Arrays.sort(students, new Comparator<Student>() { //Comparator: sort自带的
          @Override
          public int compare(Student o1, Student o2) {
            return o1.getAge()-o2.getAge();
          }
        })
        Arrays.sort(students, (o1,o2)->o1.getAge()-o2.getAge())
        Arrays.sort(students, (o1,o2)->Student.compareByAge(o1,o2));
        Arrays.sort(students, Student::compareByAge);
    }
  }

  ```

- 实例方法的引用：`对象名::实例方法名`

  ```java
    {
      public static void test2() {
          Student[] students = new Student[10];
          students[0] = new Student("张三", 18, 1.7, "男");
          // ......
          Student t = new Student();
          Arrays.sort(students, (o1,o2)->t.compareByHeight(o1,o2));
          Arrays.sort(students, t::compareByHeight);
      }
    }
  ```

- 特定类型方法的引用：`特定类的名称::方法`

  ```java
  public class Test {
    public static void main(String[] args) {
      String[] names={"Tom","Jerry","Harry","Potter","Jack","andy"};
      Arrays.sort(names,new Comparator<String>() {
        @Override
        public int compare(String o1, String o2) {
          return o1.compareToIgnoreCase(o2);
        }
      })
      Arrays.sort(names,(s1,s2)->s1.compareToIgnoreCase(s2));
      Arrays.sort(names,String::compareToIgnoreCase);
    }
  }
  ```

- 构造器的引用：`类名::new`

  ```java
   @Data
   @AllArgsConstructor
   @NoArgsConstructor
   class Car {
     private String name;
   }
   //--------------
   interface CarFactory {
     Car getCar(String name);
   }
   //------------
   public class Test {
    public static void main(String[] args) {

      // CarFactory factory = new CarFactory() {    // 1-------
      //   @Override
      //   public Car getCar(String name) {
      //     return new Car(name);
      //   }
      // }

      // CarFactory factory = (name)->new Car(name);    //2--------

      CarFactory factory = Car::new;    //3--------

      Car c1 = factory.getCar("BMW");
      System.out.println(c1);
    }
   }
  ```

## 常用 api

- String 字符串：

  1. 只有以双引号（“...”）方式写的字符串对象，会存储到“字符串常量池”中，且相同内容的字符串只存储 1 分；（节约内存）

     **注：** 常量池在堆中

  2. 通过 new 方式创建的字符串对象，每 new 一次 都会产生一个新的对象放在堆中；
  3. String(字符串)：两个字符串内容比较： "==" 默认比较的是字符串地址

- 集合：用来装数据，类似数组；大小可变，功能丰富；

  java 中的集合：HashSet、Set、TreeSet、Map 等等。。。。

  ```java
  //---没有添加类型限制-------------
    ArrayList list = new ArrayList();
    list.add("java");
    list.add(222);
  //---添加了类型限制--只能添加String类型-----------
   ArrayList<String> Arr = new ArrayList<String>();
   Arr.add("java");
   Arr.add("python");
   // Arr.add(333); // 报错

  ```

## GUI 编程：现在没啥用

AWT(Abstract Window Toolkit)：依赖操作系统 -- `淘汰了`
Swing：不依赖操作系统（推荐）

## ====加强课============================

## 异常 Java.lang.Throwable

- 异常分类

  1. Error(错误) ：一般不会发生（系统级别的，给 sun 公司用的；一般我们解决不了）；
  2. Exception(异常)：我们程序可能出现的问题；
     - RuntimeException(运行时异常)：编译器不检查，运行时检查(例：数组索引越界)；
     - 其他异常：（例 编译时异常）编译阶段就会出现的错误提醒（例：缺少文件 ）-- 在逐渐摈弃，转向运行时异常

  ![java_异常体系](./img/java_异常体系.png)

- 异常的基本处理：抛出异常（throws）、捕获异常（try catch 【catch catch。。。】）
- 自定义异常：继承 Exception 或 RuntimeException
- 异常的处理方案：1.层层向外抛，由最外层处理；2.最外层捕获异常，尝试修复

## 泛型(`<E>`) -- 泛型类、接口、方法

`ArrayList<String> list = new ArrayList<String>();`

- 常用字母；

  1. E:元素类型
  2. T：返回值类型
  3. K：键类型
  4. V：值类型

- 泛型类型：

  1. 泛型类： `修饰符 class 类名 <类型变量，类型变量，...> {}`
  2. 泛型接口： `修饰符 interface 接口名 <类型变量，类型变量，...> {}`
  3. 泛型方法、通配符、上下限

  - 型方法： `修饰符 <类型变量，类型变量，...> 返回值类型 方法名(参数列表) {}`
  - 通配符：`<?>` 可以在”使用泛型“时代表一切类型；E、T、K、V 是”定义泛型“时用
  - 上下限：`<? extends T>`

    1. 泛型上限：`<? extends T>`：? 只能是 T 或者 T 的子类
    2. 泛型下限：`<? super T>`：?只能是 T 或者 T 的父类

       `public static void print(ArrayList<? extends Cart> list) {}`

- 泛型支持的类型：

  1. 泛型不支持基本数据类型，只支持对象类型（引用数据类型）；

     - 泛型底层会转化为 object 类型；

  2. 泛型擦除：泛型工作在编译阶段，编译后泛型会被替换对应类型；
  3. 包装类：把”基本类型的数据“包装成”对象类型“；

     - 自动装箱：基本类型的数据可以直接变成包装对象的数据，不需要额外操作；

     | 基本数据类型 | 对应的包装类（引用数据类型）对象类型 |
     | ------------ | ------------------------------------ |
     | byte         | Byte                                 |
     | short        | Short                                |
     | int          | Integer【=】                         |
     | long         | Long                                 |
     | char         | Character【=】                       |
     | float        | Float                                |
     | double       | Double                               |
     | boolean      | Boolean                              |

     ```java
      Integer i = new Integer(100); // `淘汰了`-- 占内存
      Integer t1 = Integer.valueOf(100); // `推荐` -- 封装好了（-128 到 127）的固定值
      Integer t1 = Integer.valueOf(100);
      System.out.println(t1 == t2); // true
      Integer T1 = Integer.valueOf(130); // 超过（-128到127）的数字，会重新创建对象
      Integer T2 = Integer.valueOf(130);
      System.out.println(T1 == T2); //false
      //-----以上写法不考虑；用以下的--自动装箱-------------
      Integer s1 = 100; //自动装箱
      Integer s2 = 100;
      System.out.println(s1 == s2); //true
      Integer S1 = 130;
      Integer S2 = 130;
      System.out.println(S1 == S2); //false
      //----自动拆箱---------------
      int i = s1;
      System.out.println(i);//100
     //---------------------------
     ArrayList<Integer> list = new ArrayList<Integer>();
     list.add(100); //自动装箱；这里的100是Integer对象，不是int类型；
     int i = list.get(0); //自动拆箱;取得是对象，然后自动拆箱；
     ```

     - 包装类功能:

     ```java
     //====== 1、把”基本类型的数据“转换成”字符串“；=================
     int j = 23;
     String s = Integer.toString(j); // "23"
     System.out.println(s + 1); // 231
     //------------------------
     Integer i = j;
     String s2 = i.toString(); // "23"
     System.out.println(s2 + 1); // 231
     //------------------------
     String s3 = j+""; // "23"
     System.out.println(s3 + 1); //231

     // ====== 2、把”字符串数值“转换成”基本类型数据“; ==============
     String str = "98"
     // int i = Integer.parseInt(str);
     int i = Integer.valueOf(str); // 98
     System.out.println(i + 2); // 100
     //------------------------
     String str2 = "98.9"
     // double d = Double.parseDouble(str2); // 98.9
     double d = Double.valueOf(str2); // 98.9
     System.out.println(d + 2); // 100.9
     //------------------------
     String str3 = "88bb"
     int i = Integer.parseInt(str3); // 报错
     ```

## 集合框架

### 集合分类

- Collection - `单列集合【祖宗接口】`：每个元素只包含一个值（数据）；

  1. `List<E>`:【接口】添加的数据是 有序（指添加先后顺序）、可重复、有索引；

     - `ArrayList<E>`:【实现类】有序、可重复、有索引；底层基于“数组”存储数据；
     - `LinkedList<E>`:【实现类】有序、可重复、有索引；底层基于“双链表”存储数据；

  2. `Set<E>`:【接口】添加的数据是 无序（打印顺序和添加顺序不一致）、不可重复、无索引；

     - `HashSet<E>`:【实现类】无序、不可重复、无索引；
     - `TreeSet<E>`:【实现类】“按照大小默认升序排序”、不可重复、无索引；
     - `LinkedHashSet<E>`:【实现类】“有序”、不可重复、无索引；

- Map - `双列集合`：每个元素都包含两个值（数据），一个作为键，一个作为值；

![集合_Collection](./img/java_集合_Collection.png)

### 集合遍历

- Collection 遍历方式：

  1. 迭代器遍历：迭代器是用来遍历集合的专用方式（数组没有迭代器），在 java 中迭代器代表是：Iterator

     ```java
        Collection<String> list = new ArrayList<>();
        list.add("张三");
        list.add("李四");
        list.add("王五");
        Iterator<String> it = list.iterator();
        // String str = it.next();
        // it.next();// 取值并移到下一个位置；
        System.out.println(it.next());
        while (it.hasNext()) {} //it.hasNext()：判断当前是否有值（根据下标是否==长度）；
     ```

  2. 增强 for 遍历：迭代器的简化写法
     语法：`for(数据类型 变量名 : 数组或集合名)`

     ```java
     String[] list = {"张三", "李四", "王五"};
     for(String str : list) {
       System.out.println(str);
     }
     ```

  3. forEach + Lambda 表达式：

- List 遍历 （共 4 种）：Collection 遍历方式 + for 循环（有索引）；

### 认识并发修改异常问题：遍历集合的同时又存在增删集合元素的行为，可能出现业务异常

原因：for 循环，每删除一个，后面的数据填位，下标又+1（跳过了填位的数据）；

解决方法：

1. 如果集合支持索引，用 for 循环“正序遍历”时，每删除一个数据后做 i--；
2. 如果集合支持索引，用 for 循环“倒序遍历”时，直接删除；
3. 使用迭代器遍历，并用迭代器提供的删除方法删除数据；

   ```java
   while (it.hasNext()) {
     String str = it.next();
     if (str.contains("aa")) {
       it.remove(); //可以删除
       list.remove(str); //不可以删除
     }
   }
   ```
