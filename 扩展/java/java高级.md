# java 高级

## Java 里对应的“缓存 / 复用 / 单例”现象大全

；
核心思想完全一致：省内存 + 提性能；

Python 和 Java 都会缓存小对象来优化性能
不同点是：Java 把规则写进语言规范，而 Python 更多依赖 CPython 实现；

### 一、整数缓存（最经典，对应 Python 小整数池）

- 1️⃣ Integer Cache（JLS 明确规定）【🔑 规则（面试必背）：默认缓存范围：-128 ~ 127；Integer.valueOf() 会走缓存；new Integer(100) 永远新对象】
- 2️⃣ 可配置的 Integer Cache（JVM 参数）【可以把上限扩展到 256 / 1000 等；👉 Python 做不到这一点】

```java
 // 1️⃣ Integer Cache（JLS 明确规定）
    Integer a = 100;
    Integer b = 100;
    System.out.println(a == b);   // true

    Integer x = 1000;
    Integer y = 1000;
    System.out.println(x == y);   // false

  // 2️⃣ 可配置的 Integer Cache（JVM 参数）
    -XX:AutoBoxCacheMax=256
```

### 二、其他包装类型的缓存

- 3️⃣ Boolean（严格单例）

  ```java
   // 3️⃣ Boolean（严格单例）
     Boolean a = true;
     Boolean b = true;
     a == b   // true
  ```

- 4️⃣ Byte / Short / Character

| 类型      | 缓存范围   |
| --------- | ---------- |
| Byte      | -128 ~ 127 |
| Short     | -128 ~ 127 |
| Character | 0 ~ 127    |

### 三、字符串池（比 Python 更“正式”）

- 5️⃣ String Pool（常量池）【✔ 编译期进入字符串常量池；✔ JVM 规范保证】
- 6️⃣ new String() 绕过池
- 7️⃣ intern()（显式驻留）

```java
 // 5️⃣ String Pool（常量池）
   String a = "hello";
   String b = "hello";
   a == b   // true
 // 6️⃣ new String() 绕过池
   String a = "hello";
   String b = new String("hello");
   a == b   // false
 // 7️⃣ intern()（显式驻留）
   String a = new String("hello").intern();
   String b = "hello";
   a == b   // true
```

### 四、空值 & 特殊对象

- 8️⃣ null（不是对象）【没有 id；不能调用方法；不像 Python None 是对象】
- 9️⃣ 枚举（Enum）= 天然单例

```java
 // 8️⃣ null（不是对象）
    String x = null;
 // 9️⃣ 枚举（Enum）= 天然单例
    enum Status { OK, ERROR }
    Status a = Status.OK;
    Status b = Status.OK;
    a == b   // true（规范保证）
```

### 五、语言级“对象复用”设计

- 🔟 自动装箱 / 拆箱（非常容易踩坑）【👉 和 Python 的 is / == 一模一样的坑】

```java
Integer a = 100;
Integer b = 100;

a == b       // true（缓存）
a.equals(b)  // true
// =========================
Integer x = 1000;
Integer y = 1000;

x == y       // false
x.equals(y)  // true

```

### 六、类加载 & 单例级别的复用

- 1️⃣1️⃣ Class 对象唯一
- 1️⃣2️⃣ ClassLoader 决定唯一性

```java
 // 1️⃣1️⃣ Class 对象唯一
    String.class == String.class   // true
 // 1️⃣2️⃣ ClassLoader 决定唯一性
    同名类 + 不同 ClassLoader ≠ 同一个 Class
```

### 七、对照总表（Python vs Java）

| 维度       | Python      | Java          |
| ---------- | ----------- | ------------- |
| 小整数缓存 | -5 ~ 256    | -128 ~ 127    |
| 是否规范   | ❌ 实现细节 | ✅ JLS        |
| 字符串池   | 有（隐式）  | 有（强规范）  |
| intern     | sys.intern  | String.intern |
| None/null  | None 是对象 | null 不是对象 |
| is / ==    | is 判断引用 | == 判断引用   |
| equals     | == 判断值   | equals 判断值 |
