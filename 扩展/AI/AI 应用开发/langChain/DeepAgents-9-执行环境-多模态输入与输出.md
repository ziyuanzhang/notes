# DeepAgents-4.4-执行环境-多模态输入与输出

Deep Agents 提供多模态工作流的基础设施，但真正能识别、生成哪些媒体，取决于底层模型及其接口。

- 多模态用户输入

```python
  result = agent.invoke({
      "messages": [{
          "role": "user",
          "content": [
              {"type": "text", "text": "What is in this screenshot?"},
              {"type": "image", "url": "https://example.com/screenshot.png"},
          ],
      }],
  })
# --------- 读取 -------------------
# 假设 Agent 的虚拟文件系统中存在：
  /workspace/
      └── screenshot.png
# Agent 可以调用：
  read_file("/workspace/screenshot.png")
# ---------------------------------------
  from langchain.tools import tool
  @tool
  def capture_screenshot() -> list[dict]:
      """Capture a screenshot of the current page."""
      return [
          {"type": "text", "text": "Screenshot of the current page:"},
          {"type": "image", "url": "https://example.com/page.png"},
      ]
      # 工具可以把图片作为执行结果交给模型，而不仅仅是返回一段字符串。
```

## 多模态内容与上下文压缩

1. Offloading：卸载消息内容
2. Summarization：摘要压缩
   - 摘要不会自动保留原始媒体
