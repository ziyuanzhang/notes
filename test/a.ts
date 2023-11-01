@logClass
class MyClass {
  constructor() {
    console.log("MyClass constructor");
  }
}

function logClass(target: any) {
  console.log(target);
}
