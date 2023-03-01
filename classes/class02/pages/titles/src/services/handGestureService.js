import { gestureStrings, knownGestures } from "../util/gestures.js"

export default class HandGestureService {
  #gestureEstimator
  #handposeDetection
  #handsVersion
  #detector
  constructor ({fingerPose, handposeDetection, handsVersion}){
    this.#gestureEstimator = new fingerPose.GestureEstimator(knownGestures)
    this.#handposeDetection = handposeDetection
    this.#handsVersion = handsVersion
    this.detector = null
  }

  async estimate(keypoints3D) {
    const predictions = await this.#gestureEstimator.estimate(
      this.#getLandmarksFromKeypoints(keypoints3D),
      // porcentagem de confiança 90%
      9
    )

    return predictions.gestures
  }

  // async iterator, retorna conforme for recebendo
  async * detectGestures(predictions) {
    for(const hand of predictions) {
      if(!hand.keypoints3D) continue
      const gestures = await this.estimate(hand.keypoints3D)
      if(!gestures.length) continue
      const result = gestures.reduce((previous,current) => previous.score > current.score)
      const {x,y} = hand.keypoints.find(keypoint => keypoint.name === 'index_finger_tip')
      yield {event: result.name, x, y}
      console.log('detected', gestureStrings[result.name])
    }
  }

  #getLandmarksFromKeypoints(keypoints3D) {
    return keypoints3D.map(keypoint => [keypoint.x, keypoint.y, keypoint.z])
  }

  async estimateHands(video) {
    return this.#detector.estimateHands(video, {
      flipHorizontal: true
    })
  }

  async initializeDetector() {
    if (this.#detector) return this.#detector
    const detectorConfig = {
      runtime: 'mediapipe', // or 'tfjs',
      solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${this.#handsVersion}`,
      // full mais pesado e preciso
      modelType: 'lite',
      maxHands: 2,
    }
    this.#detector = await this.#handposeDetection.createDetector(
        this.#handposeDetection.SupportedModels.MediaPipeHands, 
        detectorConfig
      )

    return this.#detector
  }
}