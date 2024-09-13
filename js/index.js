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

const SELECTOR_INPUT_FLOORS = "#numberOfFloors";
const SELECTOR_INPUT_LIFTS = "#numberOfLifts";
const SELECTOR_BUTTON_GENERATE = "#buttonGenerate";

const floorsContainerElement = document.querySelector(SELECTOR_FLOORS);
const floorTemplateElement = document.querySelector(SELECTOR_FLOOR_TEMPLATE);

const liftsContainerElement = document.querySelector(SELECTOR_LIFTS);
const liftTemplateElement = document.querySelector(SELECTOR_LIFT_TEMPLATE);

const floorsInputElement = document.querySelector(SELECTOR_INPUT_FLOORS);
const liftsInputElement = document.querySelector(SELECTOR_INPUT_LIFTS);
const generateButtonElement = document.querySelector(SELECTOR_BUTTON_GENERATE);

const getLiftElementByLiftId = (liftId) => {
  const liftElement = document.querySelector(`.lift[data-lift-id='${liftId}']`);

  return liftElement;
};

const drawAndBindFloorsWithSimulation = (simulation) => {
  floorsContainerElement.innerHTML = "";

  for (let index = 0; index < simulation.numberOfFloors; index++) {
    const floor = floorTemplateElement.cloneNode(true);

    floor.removeAttribute("id");

    const floorNumber = simulation.numberOfFloors - index;

    floor.querySelector(SELECTOR_FLOOR_NUMBER).innerText = floorNumber;

    // Hide up button for top floor
    if (floorNumber === simulation.numberOfFloors) {
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

          if (!liftElement) return;

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

          if (!liftElement) return;

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

          if (!liftElement) return;

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

const drawLifts = (simulation) => {
  liftsContainerElement.innerHTML = "";

  for (let index = 0; index < simulation.lifts.length; index++) {
    const lift = liftTemplateElement.cloneNode(true);

    lift.removeAttribute("id");

    const offset = index * (LIFT_WIDTH + LIFT_GAP);
    lift.style.left = offset + "px";
    lift.dataset.liftId = simulation.lifts[index].id;

    liftsContainerElement.appendChild(lift);
  }
};

const init = () => {
  const numberOfFloors = floorsInputElement.valueAsNumber;
  const numberOfLifts = liftsInputElement.valueAsNumber;

  if (Number.isNaN(numberOfFloors) || numberOfFloors <= 0) {
    alert("Number of floors must be greater than 0");
    return;
  }
  if (Number.isNaN(numberOfLifts) || numberOfLifts <= 0) {
    alert("Number of lifts must be greater than 0");
    return;
  }

  const simulation = new LiftSimulation({
    numberOfFloors: numberOfFloors,
    numberOfLifts: numberOfLifts,
    liftSpeedPerFloorMs: 2000,
    liftDoorOpenDurationMs: 2500,
    liftDoorCloseDurationMs: 2500,
  });

  drawAndBindFloorsWithSimulation(simulation);
  drawLifts(simulation);

  getLiftElementByLiftId(1)?.scrollIntoView({
    behavior: "smooth",
  });
};

const generateFromQueryParams = () => {
  const paramsStr = window.location.search;

  const params = new URLSearchParams(paramsStr);

  const numberOfLifts = parseInt(params.get("lifts"));
  const numberOfFloors = parseInt(params.get("floors"));

  if (!numberOfFloors || !numberOfLifts) return;
  if (!Number.isInteger(numberOfFloors) || !Number.isInteger(numberOfLifts))
    return;
  if (numberOfFloors < 0 || numberOfLifts < 0) return;

  floorsInputElement.value = numberOfFloors;
  liftsInputElement.value = numberOfLifts;

  init();
};

generateButtonElement.addEventListener("click", init);

const VALID_KEYS = new Set([
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "Backspace",
  "Tab",
]);

const inputNumbersOnlyValidator = (event) => {
  if (!VALID_KEYS.has(event.key)) {
    event.preventDefault();
  }
};
floorsInputElement.addEventListener("keydown", inputNumbersOnlyValidator);
liftsInputElement.addEventListener("keydown", inputNumbersOnlyValidator);

generateFromQueryParams();
