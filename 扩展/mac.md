# mac

- mac 下载大文件添加前缀： caffeinate -i ollama pull deepseek-r1:8b；
  1. -i 表示“防止系统因空闲而睡眠”。
  2. 只要这个命令在运行，Mac 就不会自动睡眠。
  3. 下载完成后，caffeinate 自动退出，系统恢复正常的电源管理。
