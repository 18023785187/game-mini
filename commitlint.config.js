export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型定义
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复bug
        'docs',     // 文档变更
        'style',    // 代码格式（不影响代码运行的变动）
        'refactor', // 重构（既不是新增功能，也不是修改bug的代码变动）
        'perf',     // 性能优化
        'test',     // 增加测试
        'chore',    // 构建过程或辅助工具的变动
        'revert',   // 回退
        'build',    // 打包
      ],
    ],
    // 主题不能为空
    'subject-empty': [2, 'never'],
    // 主题以大写字母开头
    'subject-case': [0],
    // 主题不以句号结尾
    'subject-full-stop': [2, 'never', '.'],
    // 类型必须小写
    'type-case': [2, 'always', 'lower-case'],
    // 类型不能为空
    'type-empty': [2, 'never'],
    // 主题最大长度72字符
    'subject-max-length': [2, 'always', 72],
    // 页眉最大长度100字符
    'header-max-length': [2, 'always', 100],
    // 正文以空行开头
    'body-leading-blank': [2, 'always'],
    // 页脚以空行开头
    'footer-leading-blank': [2, 'always'],
  },
};