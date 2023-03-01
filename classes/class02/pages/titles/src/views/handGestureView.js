export default class HandGestureView {
  #canvasHand = document.querySelector('#hands')
  #canvasContext = this.#canvasHand.getContext('2d')
  constructor() {
    this.#canvasHand.width = globalThis.screen.availWidth
    this.#canvasHand.height = globalThis.screen.availHeight
  }

  clearCanvas() {
    this.#canvasContext.clearRect(0,0,this.#canvasHand.width,this.#canvasHand.height)
  }

  drawResults(hands) {
    console.log({hands})
  }

  loop(fn) {
    requestAnimationFrame(fn)
  }

  scrollPage(top) {
    scroll({
      top,
      behavior: "smooth"
    })
  }
}