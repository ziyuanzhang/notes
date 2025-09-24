# java

## mvc 模式: 对象回调

## 项目--模块--包--类

## 1、====基础类型转换==================

## 整数相除，只得整数部分；只要其中一个为小数，就可得“完整的运算结果”

## 小数相加，结果不精确（在计算机中“整数和小数”存储方式不同导致的）

## char 类型可以与数字相加减；底层逻辑执行的是 字母、符号（a）对应的 ASCII 码的数字加减【网站登录验证码】

## 默认值

- 基本类型：

  1. byte、short、char、int、long : 0
  2. float、double : 0
  3. boolean : false

- 引用类型：类、接口、数组、String : null

## arr[2]

先根据“索引”找 arr 的内存地址，再找偏移量 1，才能找到数据
`String[] arr = new String[3];`

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

## 函数式编程：方法引用 （Lambda 表达式 的简化）

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

两个字符串内容比较： "==" 默认比较的是字符串地址

## GUI 编程
