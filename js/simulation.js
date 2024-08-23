import { delay } from "./utils.js";

/**
 * @typedef {{
 *  id: string,
 *  currentFloor: number,
 *  isMoving: boolean
 * }} Lift
 *
 * An object that represents a lift
 */

/**
 * A callback that is fired when a lift starts moving.
 *
 * @callback OnLiftMoveStart
 * @param {Lift} lift - The lift that started moving
 * @param {number} fromFloor - The floor from which the lift started moving
 * @param {number} toFloor - The floor to which the lift is going
 * @param {number} duration - The time in milliseconds it will take for the lift to move
 *
 * @returns {void}
 */

/**
 * A callback that is fired when a lift stops moving.
 *
 * @callback OnLiftMoveEnd
 * @param {Lift} lift - The lift that stopped moving
 * @param {number} fromFloor - The floor from which the lift started moving
 * @param {number} toFloor - The floor on which the lift ended at
 *
 * @returns {void}
 */

/**
 * A callback that is fired when a lift opens its doors.
 *
 * @callback OnLiftDoorsOpen
 * @param {Lift} lift - The lift that opened its doors
 * @param {number} duration - The time in milliseconds it will take to open the doors
 *
 * @returns {void}
 */

/**
 * A callback that is fired when a lift closes its doors.
 *
 * @callback OnLiftDoorsClose
 * @param {Lift} lift - The lift that closed its doors
 * @param {number} duration - The time in milliseconds it will take to close the doors
 *
 * @returns {void}
 */

/**
 * @typedef {{
 *  floorNumber: number,
 *  onLiftMoveStart?: OnLiftMoveStart,
 *  onLiftMoveEnd?: OnLiftMoveEnd,
 *  onLiftDoorsOpen?: OnLiftDoorsOpen,
 *  onLiftDoorsClose?: OnLiftDoorsClose
 * }} LiftCall
 *
 * An object that represents a lift call with its associated callbacks.
 */

const DEFAULT_LIFT_SPEED_PER_FLOOR = 2000;
const DEFAULT_LIFT_DOOR_OPEN_DURATION = 2500;
const DEFAULT_LIFT_DOOR_CLOSE_DURATION = 2500;
const DEFAULT_LIFT_FLOOR = 1;

export default class LiftSimulation {
  /**
   * Create a new lift simulation instance.
   *
   * @param {Object} options - Lift simultation constructor options
   * @param {number} options.numberOfLifts - Number of lifts for the simulation
   * @param {number} options.numberOfFloors - Number of floors for the simulation
   *
   * @param {number} [options.liftSpeedPerFloorMs] - Time it takes for the lift to move a single floor
   * @param {number} [options.liftDoorOpenDurationMs] - Time it takes for the lift doors to open
   * @param {number} [options.liftDoorCloseDurationMs] - Time it takes for the lift doors to close
   *
   * @param {OnLiftMoveStart} [options.onLiftMoveStart] - callback that is fired when a lift starts moving
   * @param {OnLiftMoveEnd} [options.onLiftMoveEnd] - callback that is fired when a lift stops moving
   * @param {OnLiftDoorsOpen} [options.onLiftDoorsOpen] - callback that is fired when a lift opens its doors
   * @param {OnLiftDoorsClose} [options.onLiftDoorsClose] - callback that is fired when a lift closes its doors
   */
  constructor(options) {
    // TODO: Options validation

    /** @readonly */
    this.numberOfLifts = options.numberOfLifts;
    /** @readonly */
    this.numberOfFloors = options.numberOfFloors;

    /** @readonly */
    this.liftSpeedPerFloorMs =
      options.liftSpeedPerFloorMs === undefined
        ? DEFAULT_LIFT_SPEED_PER_FLOOR
        : options.liftSpeedPerFloorMs;

    /** @readonly */
    this.liftDoorOpenDurationMs =
      options.liftDoorOpenDurationMs === undefined
        ? DEFAULT_LIFT_DOOR_OPEN_DURATION
        : options.liftDoorOpenDurationMs;

    /** @readonly */
    this.liftDoorCloseDurationMs =
      options.liftDoorCloseDurationMs === undefined
        ? DEFAULT_LIFT_DOOR_CLOSE_DURATION
        : options.liftDoorCloseDurationMs;

    /** @private */
    this.onLiftMoveStart = options.onLiftMoveStart;
    /** @private */
    this.onLiftMoveEnd = options.onLiftMoveEnd;
    /** @private */
    this.onLiftDoorsOpen = options.onLiftDoorsOpen;
    /** @private */
    this.onLiftDoorsClose = options.onLiftDoorsClose;

    /**
     * @private
     * @type {Lift[]}
     */
    this.lifts = new Array(this.numberOfLifts).fill(null).map((_, index) => ({
      id: index + 1,
      currentFloor: DEFAULT_LIFT_FLOOR,
      isMoving: false,
    }));

    /**
     * @private
     * @type {LiftCall[]}
     */
    this.liftCallQueue = [];
  }

  /**
   * @private
   *
   * Find the closest idle lift to the given floor number.
   * Returns `null` if no lift is found.
   *
   * @param {number} floorNumber - The floor number to find a closest lift to
   *
   * @returns {Lift | null}
   */
  _findClosestIdleLiftToFloor = (floorNumber) => {
    let minDistance = Infinity;
    let closestLift = null;

    for (const lift of this.lifts) {
      if (lift.isMoving) {
        continue;
      }

      const distance = Math.abs(lift.currentFloor - floorNumber);

      if (distance < minDistance) {
        minDistance = distance;
        closestLift = lift;
      }
    }

    return closestLift;
  };

  /**
   * @private
   * Move a lift to the given floor number and fire the associated callback.
   *
   * @param {Lift} lift - The lift to move
   * @param {LiftCall} liftCall - The lift call to fullfill
   *
   * @returns {void}
   */
  _moveLift = async (lift, liftCall) => {
    const totalMoveDurationMs =
      Math.abs(lift.currentFloor - liftCall.floorNumber) *
      this.liftSpeedPerFloorMs;

    const _fromFloor = lift.currentFloor;
    const _toFloor = liftCall.floorNumber;
    const _moveDuration = totalMoveDurationMs;
    const _doorOpenDuration = this.liftDoorOpenDurationMs;
    const _doorCloseDuration = this.liftDoorCloseDurationMs;

    lift.isMoving = true;

    // Lift move start
    liftCall.onLiftMoveStart?.(lift, _fromFloor, _toFloor, _moveDuration);
    this.onLiftMoveStart?.(lift, _fromFloor, _toFloor, _moveDuration);

    if (lift.currentFloor !== liftCall.floorNumber) {
      await delay(totalMoveDurationMs);
    }

    lift.currentFloor = liftCall.floorNumber;

    // Open lift doors
    liftCall.onLiftDoorsOpen?.(lift, _doorOpenDuration);
    this.onLiftDoorsOpen?.(lift, _doorOpenDuration);
    await delay(this.liftDoorOpenDurationMs);

    // Close lift doors
    liftCall.onLiftDoorsClose?.(lift, _doorCloseDuration);
    this.onLiftDoorsClose?.(lift, _doorCloseDuration);
    await delay(this.liftDoorCloseDurationMs);

    lift.isMoving = false;

    // Lift move end
    liftCall.onLiftMoveEnd?.(lift, _fromFloor, _toFloor);
    this.onLiftMoveEnd?.(lift, _fromFloor, _toFloor);
  };

  /**
   * Call a lift to the given floor number.
   *
   * @param {LiftCall} liftCall - Lift call options
   *
   * @returns {void}
   */
  callLift = (liftCall) => {
    // TODO: Validate lift call
    this.liftCallQueue.push(liftCall);
  };

  /**
   * Run the simulation
   *
   * @returns {void}
   */
  run = () => {
    // TODO: Optimize and refactor
    if (this.liftCallQueue.length === 0) {
      setTimeout(this.run, 100);
      return;
    }

    const liftCall = this.liftCallQueue.shift();

    if (!liftCall) {
      setTimeout(this.run, 100);
      return;
    }

    const closestLift = this._findClosestIdleLiftToFloor(liftCall.floorNumber);

    if (!closestLift) {
      this.liftCallQueue.unshift(liftCall);
      setTimeout(this.run, 100);
      return;
    }

    this._moveLift(closestLift, liftCall);

    setTimeout(this.run, 100);
  };

  /**
   * Stop the simulation.
   *
   * @returns {void}
   */
  stop = () => {
    // TODO: Implement
  };
}
