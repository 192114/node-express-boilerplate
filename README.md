# Poetry Service

## 关于 TypeScript 导入路径的说明

### 为什么使用 `.js` 而不是 `.ts` 扩展名？

在本项目中，你会看到所有的 import 语句都使用 `.js` 扩展名，例如：

```typescript
import { HttpError } from "../utils/httpError.js";
```

而不是：

```typescript
import { HttpError } from "../utils/httpError.ts";  // ❌ 错误
```

**原因如下：**

1. **ES 模块规范要求**：本项目使用 ES 模块（`package.json` 中设置了 `"type": "module"`），ES 模块规范要求导入语句必须包含完整的文件扩展名。

2. **指向编译后的文件**：TypeScript 会将 `.ts` 文件编译成 `.js` 文件。导入路径中的扩展名应该对应编译后的文件类型，而不是源文件类型。

3. **NodeNext 模块解析**：项目使用了 `"moduleResolution": "NodeNext"`，这种模式遵循 Node.js 的 ES 模块解析规则，要求显式指定 `.js` 扩展名。

4. **运行时正确性**：编译后的代码在 Node.js 中运行时，实际加载的是 `.js` 文件，因此导入路径必须匹配运行时的实际文件。

**总结：** 虽然源文件是 `.ts`，但导入时必须写 `.js`，这是 TypeScript + ES 模块的标准做法。TypeScript 编译器会自动处理这种映射关系。

