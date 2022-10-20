# Peintre

A lightweight configurable Vue3 canvas painter component. 

<p align='center'>
<a href='./README.EN.md'>English</a> | 简体中文
</p>

## Feature

1. Multi Layer √
2. Change Tool Color&Size √
3. Rectangle、Circle,etc Tool √
4. Pressure Support √
5. Mobile Touch Support √
6. Switch Layer with Dragging √
7. Change Tool Size with Scroll Event √
8. Redo Support √

## Live Demo

[Demo](https://oceanpresentchao.github.io/Peintre/)


## Installation

### With npm

```bash
npm i -S peintre
```

## Usage

```html
import {Painter} from "peintre"

<Painter :pressure="false" :width="800" :height="600" :maxLine="500" :minLine="1"></Painter>

```
## Props

| Attribute  | Description | Type                                          | Default |
| ---------  | ----------- | --------------------------------------------- | ------- |
| width    | canvas width   | number |   800     |
| height    | canvas height   | number |   600     |
| maxLine    | max context linewidth   | number |   500     |
| minLine    | min context linewidth   | number |   1     |
| pressure    | whether support pressure or not   | boolean |   false    |
| lang    | Language   | string |  "zh" \| "en"    |

## DevelopmentBlog(zh-CN)
[Peintre DevelopmentBlog](http://oceanpresent.art/posts/hard-boiled-wonderland/peintre)