export function window2canvas(canvas:HTMLCanvasElement,windowX:number,windowY:number){
  const box = canvas.getBoundingClientRect()
  return {
    x: windowX - box.left * (canvas.width / box.width),
    y: windowY - box.top * (canvas.height / box.height)
  }
}