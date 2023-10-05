// --------------------------------------------------------------------------------
// Utils
// --------------------------------------------------------------------------------

const dispatchEvent = (type: string, src: any, target: any) => {
  const event = new CustomEvent(type, {
    detail: { src, target }
  });
  document.dispatchEvent(event);
};

function getDocumentCoords(elem: any) { // crossbrowser version
  const box = elem.getBoundingClientRect();

  const body = document.body;
  const docEl = document.documentElement;

  const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
  const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

  const clientTop = docEl.clientTop || body.clientTop || 0;
  const clientLeft = docEl.clientLeft || body.clientLeft || 0;

  const top = box.top + scrollTop - clientTop;
  const left = box.left + scrollLeft - clientLeft;

  return { top: Math.round(top), left: Math.round(left) };
}

// --------------------------------------------------------------------------------
// Core
// --------------------------------------------------------------------------------

const HIDE_ORIGINAL = false;

export const dndTest = (elSelf: HTMLElement) => {
  const handleMouseDown = (event: any) => {

    event.stopPropagation();

    let isTouch = !!event.targetTouches; // the only trick for dual touch+mouse mode

    if (isTouch) {
      event = event.targetTouches[0];
    }

    let shiftX = event.clientX - elSelf.getBoundingClientRect().left;
    let shiftY = event.clientY - elSelf.getBoundingClientRect().top;

    let cloned: any = elSelf.cloneNode(true);

    // (1) prepare to moving: make absolute and on top by z-index

    // set the absolute width
    // ball.style.width = ball.getBoundingClientRect().width + 'px';
    // ball.style.height = ball.getBoundingClientRect().height + 'px';
    cloned.style.width = elSelf.getBoundingClientRect().width + 'px';
    cloned.style.height = elSelf.getBoundingClientRect().height + 'px';

    cloned.style.position = 'absolute';
    cloned.style.zIndex = 8;

    document.body.append(cloned);

    // centers the ball at (pageX, pageY) coordinates
    function moveAt(pageX: number, pageY: number) {
      // ball.style.left = pageX - shiftX + 'px';
      // ball.style.top = pageY - shiftY + 'px';

      cloned.style.left = pageX - shiftX + 'px';
      cloned.style.top = pageY - shiftY + 'px';

      // cloned.style.left = pageX - ball.offsetWidth / 2 + 'px';
      // cloned.style.top = pageY - ball.offsetHeight / 2 + 'px';
    }

    // move our absolutely positioned ball under the pointer
    moveAt(event.pageX, event.pageY);

    let currentDroppable: any = null;
    let topOrBottom = 'none';

    function onMouseMove(event: any) {
      if (isTouch) {
        event = event.targetTouches[0];
      }
      moveAt(event.pageX, event.pageY);

      if (HIDE_ORIGINAL) {
        elSelf.hidden = true;
      }
      cloned.hidden = true;
      let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      if (!HIDE_ORIGINAL) {
        elSelf.hidden = false;
      }
      cloned.hidden = false;

      if (!elemBelow) return;

      // potential droppables are labeled with the class "droppable" (can be other logic)
      let droppableBelow = elemBelow.closest('.mdnd-item');

      if (currentDroppable) {
        const top = getDocumentCoords(currentDroppable).top;
        const offsetYRatio = (event.pageY - top) / currentDroppable.getBoundingClientRect().height;
        const currentTopOrBottom = offsetYRatio < .5 ? 'top' : 'bottom';
        if (currentTopOrBottom != topOrBottom) {
          if (currentTopOrBottom === 'top') {
            dispatchEvent('mdnd_move_top', elSelf, currentDroppable);
          } else if (currentTopOrBottom === 'bottom') {
            dispatchEvent('mdnd_move_bottom', elSelf, currentDroppable);
          }
          topOrBottom = currentTopOrBottom;
        }
      }

      if (currentDroppable != droppableBelow) {
        if (currentDroppable) {
          dispatchEvent('mdnd_leave', elSelf, currentDroppable);
        }
        currentDroppable = droppableBelow;
        if (currentDroppable) {
          dispatchEvent('mdnd_enter', elSelf, currentDroppable);
        }
      }
    }

    // (2) move the ball on mousemove
    if (isTouch) document.addEventListener('touchmove', onMouseMove);
    else document.addEventListener('mousemove', onMouseMove);

    // (3) drop the ball, remove unneeded handlers
    cloned.onmouseup = function () {
      if (isTouch) document.removeEventListener('touchmove', onMouseMove);
      else document.removeEventListener('mousemove', onMouseMove);
      cloned.onmouseup = null;
      cloned.remove();

      dispatchEvent('mdnd_drop', elSelf, currentDroppable);
    };

    // prevent default drag
    elSelf.ondragstart = function () {
      return false;
    };
  };

  elSelf.onmousedown = handleMouseDown;
  elSelf.ontouchstart = handleMouseDown;
};
