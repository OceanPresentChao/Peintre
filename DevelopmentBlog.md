---
title: Peintre开发日志
author: OceanPresent
time: '2022-05-20'
lang: zh-CN
---

# Peintre开发日志

## 如何实现多图层

多个canvas添加，将其position属性设置为absolute。记录当前选中图层，获取其context进行绘制。最终保存图片时，将所有图层都绘制到同一个canvas上，然后再保存下载即可。
多图层的拖动摆放使用了[vue.draggable.next](https://github.com/SortableJS/vue.draggable.next)库

## 如何实现画笔

在canvas容器上绑定鼠标事件。

1. mousedown
在鼠标点击处绘制一个圆

2. mousemove
如果是不断画圆的话，当鼠标移动过快时，绘制速度会跟不上鼠标的速度，导致画出来的效果是一连串独立的圆。为了解决这个问题需要将相邻的圆点用直线连接起来

3. mouseleave
终止绘画，闭合路径

> 橡皮工具的实现同理

## 关于画笔的透明度

canvas设置strokestyle和fillstyle时允许rgba等带有透明度的颜色，画出来的效果也具有透明度。
但有一个问题是画笔设置了linejoin和linecap属性，会自动对路径进行一些修正，修正时会导致某些地方绘制了多次（触发事件一次，canvas自动修正一次）重复绘制的地方的颜色会更深，整体线条显得有“节点”，使用体验很差。目前我还没有想到好的解决办法，因此画笔的opacity都设置为1

## 如何修改画笔cursor

最初是打算修改dom元素的cursor样式，将cursor设置为一个圆圈svg图像，效果不错。但是这只能做到静态样式，没办法随画笔的改变而改变圆圈的半径，使用vue的动态样式也不行，因为传入的应为一个url()，不过可能是我不会处理。

最终的解决方法为：单独设置一个canvas图层，放在最顶层。绑定鼠标事件不断绘制一个半径与“当前画笔半径”相关的圆圈，并把原生的cursor样式设置为none，就产生了动态cursor的效果

## 如何实现压感支持
使用了[Pressure](https://github.com/stuyam/pressure)库，通过感知压感来调节当前画笔大小