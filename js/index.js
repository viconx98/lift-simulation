import LiftSimulation from "./simulation.js";

const LIFT_WIDTH = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue(
    "--lift-width-int"
  )
);

const LIFT_HEIGHT = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue(
    "--lift-height-int"
  )
);

const LIFT_GAP = 8;

const SELECTOR_FLOORS = "#floors";
const SELECTOR_FLOOR_TEMPLATE = "#floor-template";
const SELECTOR_FLOOR_NUMBER = ".floor-number";
const SELECTOR_FLOOR_BUTTON_UP = ".floor-button-up";
const SELECTOR_FLOOR_BUTTON_DOWN = ".floor-button-down";

const SELECTOR_LIFTS = "#lifts";
const SELECTOR_LIFT_TEMPLATE = "#lift-template";
const SELECTOR_DOOR_LEFT = ".door-left";
const SELECTOR_DOOR_RIGHT = ".door-right";

const floorsContainerElement = document.querySelector(SELECTOR_FLOORS);
const floorTemplateElement = document.querySelector(SELECTOR_FLOOR_TEMPLATE);

const liftsContainerElement = document.querySelector(SELECTOR_LIFTS);
const liftTemplateElement = document.querySelector(SELECTOR_LIFT_TEMPLATE);

const getLiftElementByLiftId = (liftId) => {
  const liftElement = document.querySelector(`.lift[data-lift-id='${liftId}']`);

  return liftElement;
};

const drawAndBindFloorsWithSimulation = (floorCount, simulation) => {
  for (let index = 0; index < floorCount; index++) {
    const floor = floorTemplateElement.cloneNode(true);

    floor.removeAttribute("id");

    const floorNumber = floorCount - index;

    floor.querySelector(SELECTOR_FLOOR_NUMBER).innerText = floorNumber;

    // Hide up button for top floor
    if (floorNumber === floorCount) {
      floor.querySelector(SELECTOR_FLOOR_BUTTON_UP).style.display = "none";
    }

    // Hide down button for bottom floor
    if (floorNumber === 1) {
      floor.querySelector(SELECTOR_FLOOR_BUTTON_DOWN).style.display = "none";
    }

    // Attach up/down button callbacks
    const onFloorButtonClicked = (event) => {
      event.target.disabled = true;

      simulation.callLift({
        floorNumber,
        onLiftMoveStart: (lift, _, to, duration) => {
          const liftElement = getLiftElementByLiftId(lift.id);

          const offset = (to - 1) * LIFT_HEIGHT;

          liftElement.animate(
            [
              {
                bottom: offset + "px",
              },
            ],
            {
              duration: duration,
              fill: "forwards",
            }
          );
        },
        onLiftMoveEnd: () => {
          event.target.disabled = false;
        },
        onLiftDoorsOpen: (lift, duration) => {
          const liftElement = getLiftElementByLiftId(lift.id);

          const offset = -(LIFT_WIDTH / 2);

          liftElement
            .querySelector(SELECTOR_DOOR_LEFT)
            .animate([{ left: offset + "px" }], {
              duration: duration,
              fill: "forwards",
            });

          liftElement
            .querySelector(SELECTOR_DOOR_RIGHT)
            .animate([{ right: offset + "px" }], {
              duration: duration,
              fill: "forwards",
            });
        },

        onLiftDoorsClose: (lift, duration) => {
          const liftElement = getLiftElementByLiftId(lift.id);

          const offset = 0;

          liftElement
            .querySelector(SELECTOR_DOOR_LEFT)
            .animate([{ left: offset + "px" }], {
              duration: duration,
              fill: "forwards",
            });

          liftElement
            .querySelector(SELECTOR_DOOR_RIGHT)
            .animate([{ right: offset + "px" }], {
              duration: duration,
              fill: "forwards",
            });
        },
      });
    };

    floor
      .querySelector(SELECTOR_FLOOR_BUTTON_UP)
      .addEventListener("click", onFloorButtonClicked);
    floor
      .querySelector(SELECTOR_FLOOR_BUTTON_DOWN)
      .addEventListener("click", onFloorButtonClicked);

    floorsContainerElement.appendChild(floor);
  }
};

const drawLifts = (liftCount) => {
  for (let index = 0; index < liftCount; index++) {
    const lift = liftTemplateElement.cloneNode(true);

    lift.removeAttribute("id");

    const offset = index * (LIFT_WIDTH + LIFT_GAP);
    lift.style.left = offset + "px";
    lift.dataset.liftId = index + 1;

    liftsContainerElement.appendChild(lift);
  }
};

const init = () => {
  const numberOfFloors = 2;
  const numberOfLifts = 5;

  const simulation = new LiftSimulation({
    numberOfFloors: numberOfFloors,
    numberOfLifts: numberOfLifts,
    liftSpeedPerFloorMs: 2000,
    liftDoorOpenDurationMs: 2500,
    liftDoorCloseDurationMs: 2500,
  });

  drawAndBindFloorsWithSimulation(numberOfFloors, simulation);
  drawLifts(numberOfLifts);
};

init();
