---
title: 你是什么宽什么高？
author: OceanPresent
time: '2022-05-14'
lang: zh-CN
---

# 你是什么宽什么高？

## 前言

在做自己的[简易画板]()时，绑定鼠标事件时不可避免地需要知道此时鼠标在什么位置。然而去MDN查找时发现DOM元素在宽高这方面的属性实在是太多了，而且不知道名字也很难找到，找到了也很难记住。因此本篇就来盘点辨识一下各个宽和各个高。

## window
### window.innerHeight

浏览器窗口的视口（viewport）高度（以像素为单位）(视口即浏览器窗口展示页面的部分)；如果有水平滚动条，也包括滚动条高度(即在页面上看到的滚动条的那点“厚度”)。

属性为只读，且没有默认值。

### window.innerWidth

同上，只不过是宽度

### window.outerHeight

整个浏览器窗口的高度（单位：像素），包括侧边栏（如果存在）、窗口镶边（window chrome）和窗口调正边框（window resizing borders/handles）。

### window.outerWidth

同上，只不过是宽度

![](https://developer.mozilla.org/@api/deki/files/213/=FirefoxInnerVsOuterHeight2.png)

### window.scrollX


### window.scrollY 

### Window.pageXOffset
scrollX的别名

### Window.pageYOffset
scrollY的别名