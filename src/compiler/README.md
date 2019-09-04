1. parse 解析
    1. lexical analysis: 
        1. 在 parseHTML 中使用正则摘取 token
    2. syntactic analysis: 
        1. 在 parseHTML 的 start(还有end 中的 slot) 钩子 中 createASTElement
        2. 再补上 attr 等属性，成为完整的 AST
2. optimizer
    1. 优化静态节点
3. code generator
    1. 生成

## 可以看到
1. 因为XML的结构还是很适合深搜的
2. 在 start 中 产生 AST 节点，边解析边补全属性，将两步分析合二为一