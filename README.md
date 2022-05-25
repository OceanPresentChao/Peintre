# Peintre

一个开箱即用的可配置的轻量级Vue3画板组件。支持多图层、压感

## Feature

1. 多图层 √
2. 可切换画笔颜色、大小 √
3. 图形工具 √
4. 压感支持 √
5. 触屏设备支持
6. 图层拖拽摆放 √
7. 滚轮修改画笔大小，光标大小随画笔变化 √
8. 撤销操作 √

## Live Demo

[Demo](https://oceanpresentchao.github.io/Peintre/)


## Installation

### With npm

```bash
npm i -S peintre@next
```

## Usage

```html
import Peintre from "peintre"

<Peintre :pressure="false" :width="800" :height="600" :maxLine="500" :minLine="1"></Peintre>

```
