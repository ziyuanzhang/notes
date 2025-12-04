# python 进阶

- 面向过程 与 面向对象

  1. 面向过程：强调过程，第一步、第二步、第三步。。。。
  2. 面向对象：强调以“对象为基础”完成各种操作，对象是具有属性和方法的（例：洗衣服，交给别人/机器，让它做）。
     - 它是基于面向过程的

- 封装、继承、多态

  1. 封装：【好处：简化编程】；隐藏对象的属性和实现细节，仅对外公开接口；
  2. 继承：【好处：代码复用】；子类继承父类的属性和方法；使得子类对象（实例）具有父类的特征和行为；
  3. 多态：【好处：解耦合，可扩展】同一个事物在不同时刻做出的反应不一样；例：（同一个人）在教室是学生，在商场是顾客，在家是。。。
     - 同一个函数接收参数不一样，表现出来的结果也不一样；

- 类与对象

  1. 类：是抽象模板（图纸）
  2. 对象：是类的具体实例（按图纸造出来的东西）；有 属性（名词）、方法（动词）

  ![Python的栈与堆](./img/Python的栈与堆.png)

## 类

- self 关键字：用于指向“对象实例本身”；

  1. 谁调用，指向谁
  2. 类似 js 中的 this 关键字

- 魔法方法：

  在 Python 中，有一些可以"给 Python 类增加魔力的特殊方法"，它们"总是被双下划线所包围"，我们称之为魔法方法。"在特殊情况下会被自动调用"，不需要开发者手劲去调用。

  1. `__init__()` ：在创建对象时调用，初始化方法；
  2. `__str__()` ：打印对象时调用，返回对象的字符串表示【不重写，print()对象时，返回对象的内存地址】；
  3. `__del__()` ： 当.py 文件执行结束后 或 手动删除对象后调用；

  ```python
  class Car:
    def __init__(self, name, color):
        self.name = name
        self.color = color

    def show(self):
        print("name:", self.name, "color:", self.color)

    def __str__(self):
        return f'{self.name} {self.color}'

    def __del__(self):
        print("对象被删除")

  c1=Car("BMW", "white")
  c1.show() # name: BMW color: white
  print(c1.name,c1.color)
  ```

### 类的高级

- 三种定义方式：

  1. `class 类名:`
  2. `class 类名():`
  3. `class 类名(父类):`

- 多继承：优先左边顺序

  1. `class 类名(父类1, 父类2):`优先“父类 1 ”的属性名和方法
  2. mro: 查看继承顺序

  3. 重写：

  ```python
      class blueCar:
        def __init__(self):
            self.name = "blue"
        def show(self):
            print("name:", self.name)

      class redCar:
        def __init__(self):
            self.name = "red"
        def show(self):
            print("name:", self.name)
        def run():
            print("run")

      class Car(blueCar, redCar):
        def __init__(self):
            self.name = "new"
        def show(self):
            print("name:", self.name)
        def show_blue(self):
            self.show() #就近，调用本身的
            ## 方法1
            blueCar.__init__(self) # 传进去并改变self的name: blue
            blueCar.show(self) #self的name已经是blue了
        def show_red(self):
            redCar.__init__(self)
            redCar.show(self)
        def show_parent(self):
            ## 方法2
            super().run()
      if __name__ == "__main__":
         c1 = Car()
         print(c1.mro()) # c1--> blueCar --> redCar --> object
         c1.show() # name: new
         print("------------------")
         c1.show_blue() # name: blue
         c1.show() # name: blue
         print("------------------")
         c1.show_red() # name: red
         c1.show() # name: red
         print("------------------")
         c1.show_parent() #查找顺序 blueCar -->redCar --> object

  ```

- 封装

  ```python
    class Person:
        def __init__(self, name):
            self.name = name
            self.__mobile = "123456" # 私有属性
        def get_mobile(self):
            return self.__mobile

    class Student(Person):
        pass
    if __name__ == "__main__":
        s1 = Student("张三")
        print(s1.name) # 张三
        print(s1.__mobile) # 报错
        print(s1.get_mobile()) # 123456
  ```

### 对象属性、类属性、类方法、静态方法

- 对象属性: 对象实例的属性，对象实例有自己单独的属性；
- 类属性: 属于类的；即:能被该类下所有的对象所共享。A 对象修改类属性，B 对象访问的是修改后的.
- 类方法: 属于类的；定义时，必须使用“装饰器@clasSmethod”，且“第 1 个参数”必须表示类对象，通常以 cls 作为第一个参数名。
- 静态方法: 需要使用“装饰器@staticmethod” 来标识其为静态方法，静态方法与普通方法一样，只是不需要 self 参数。

**注：** 类方法 与 静态方法 区别不大；

```python
class Student:
    teacher_name = "张三" # 类属性
    def __init__(self,name):
        self.name = name # 对象属性
    def show_name(self):
        print("学生name:", self.name)
    @classmethod # 类方法
    def show_classMethod(cls):
        print("teacher:", cls.teacher_name)
        print("teacher:", Student.teacher_name)
    @staticmethod # 静态方法
    def show_staticMethod():
        print("teacher:", Student.teacher_name)

if __name__ == "__main__":
    s = Student("学生")
    s.show_name()
    s.show_classMethod()
    s.show_staticMethod()
```

## 闭包

闭包：根据词法作用域的规则，内部函数总是可以访问其外部函数中声明的变量，当通过调用一个外部函数返回一个内部函数后，即使外部函数已经执行结束了，但是内部函数引用外部函数的变量依旧保存在内存中，把这些变量的集合称为闭包；

`fn_outer(100)(200)`: 其中 `fn_outer(100)`是外部函数执行后返回的内部函数`fn_inner`，等价于 `fn_inner(200)`；

- global: 关键字用来在函数或其他局部作用域中使用全局变量。但是如果不修改全局变量也可以不使用 global 关键字。
- nonlocal: 声明的变量不是局部变量,也不是全局变量,而是外部嵌套函数内的变量。

![Python_闭包1](./img/Python_闭包1.png)
![Python_闭包2](./img/Python_闭包2.png)

### 装饰器 -- 本质上就是一个闭包函数

装饰器目的：在不改变原有函数的情况下，给函数添加功能；

装饰器: 本质上是一个高阶函数

```python
# 传统装饰器 -- 高阶函数
def check_login(fn_name):
    def fn_inner():
        # 额外功能
        print("检验登录。。。")
        fn_name()
    return fn_inner

def comment():
    print("发表评论。。。")
def payment():
    print("支付。。。")

# 调用---------------
comment = check_login(comment)
comment()
print("-"*23)
payment = check_login(payment)
payment()
```

```python
# 函数装饰器 -- 语法糖
def check_login(fn_name):
    def fn_inner():
        # 额外功能
        print("检验登录。。。")
        fn_name()
    return fn_inner

@check_login
def comment():
    print("发表评论。。。")

@check_login
def payment():
    print("支付。。。")

# 调用---------------
comment()
print("-"*23)
payment()
```

- 被装饰函数的 4 种情况：

  1. 无参无返: 计数用
  2. 有参无返回: 统计用

     ![python_装饰器-有参无返回](./img/python_装饰器-有参无返回.png)

  3. 无参有返回
  4. 有参有返回
     ![python_装饰器-有参有返回](./img/python_装饰器-有参有返回.png)

- 多个装饰器的装饰过程是: 离函数最近的装饰器先装饰，然后外面的装饰器再进行装饰，由内到外的装饰过程;

  ```python
    # ---装饰器写法---（装饰器从上到下执行）---------
    @checkout_login
    @checkout_code
    def comment():
         print("发表评论。。。")

    # ---传统写法-----（栈的形式）----------
    cc = checkout_code(comment)
    cl = checkout_login(cc)
    cl()
  ```

  ![python_装饰器(多个)-传统执行流程](<./img/python_装饰器(多个)-传统执行流程.png>)

- 使用带有参数的装饰器，其实是在装饰器外面又包裹了一个函数，使用该函数接收参数，返回装饰器。
  1. 装饰器每层只能传一个参数

## 拷贝

- 赋值：只是创建别名，不创建新对象
- 浅拷贝：创建新容器，但填充的是原内容的引用

  1. 对象没有嵌套结构或嵌套结构不可变
  2. 需要共享嵌套对象引用时
  3. 对性能要求较高时

- 深拷贝：递归创建所有内容的新副本
  1. 对象有嵌套的可变结构
  2. 需要完全独立的副本
  3. 修改副本不应影响原始对象时

* 不可变对象：（数字、字符串、元组）原数据、深拷贝浅拷贝，都指向同一个对象；
* 可变对象：深拷贝 创建新的对象，浅拷贝 创建新的对象，但填充的是原对象的引用；

## 网络
