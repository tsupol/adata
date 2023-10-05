export const dispatchEvent = (type: string, src: HTMLElement, target: HTMLElement | null, data?: any) => {
  const event = new CustomEvent(type, {
    detail: { src, target, data }
  });
  document.dispatchEvent(event);
};

const getNodeListIndex = (elSelf: HTMLElement) => {
  if (!elSelf?.parentNode) {
    return -1;
  }
  const arr = Array.prototype.slice.call(elSelf.parentNode.childNodes);
  return arr.indexOf(elSelf);
};

function debounce(func: any, timeout = 10) {
  let timer: any;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(debounce, args); }, timeout);
  };
}

// --------------------------------------------------------------------------------
// Core
// --------------------------------------------------------------------------------

export const dndMasonry = (elSelf: HTMLElement) => {

  let currentDroppable: any = null;
  let placeHolder: any = null;

  const handleMouseDown = (event: any) => {

    if ((event?.target as Element)?.closest('.mdnd-disabled')) {
      return;
    }
    if ((event?.target as Element)?.classList.contains('mdnd-item-close')) {
      return false;
    }

    event.stopPropagation();

    let isTouch = false;
    if (event instanceof TouchEvent) {
      isTouch = !!event.targetTouches;
      event = event.targetTouches[0];
    }

    if (isTouch) {
      event = event.targetTouches[0];
    }

    const shiftX = event.clientX - elSelf.getBoundingClientRect().left;
    const shiftY = event.clientY - elSelf.getBoundingClientRect().top;

    // (2) replace with the placeholder

    placeHolder = document.createElement('div');
    placeHolder.classList.add('mdnd-placeholder');
    placeHolder.style.width = elSelf.getBoundingClientRect().width + 'px';
    placeHolder.style.height = elSelf.getBoundingClientRect().height + 'px';
    const currentIndex = getNodeListIndex(elSelf);
    if (currentIndex < 0) {
      throw new Error('Cannot get the index (nth-child of self)');
    }
    elSelf.parentNode?.insertBefore(placeHolder, elSelf.parentNode.children[currentIndex]);

    // (1) prepare to moving: make absolute and on top by z-index

    // set the absolute width
    const moveContainer = document.createElement('div');
    moveContainer.classList.add('mdnd-move-container');
    moveContainer.style.width = elSelf.getBoundingClientRect().width + 'px';
    moveContainer.style.height = elSelf.getBoundingClientRect().height + 'px';
    moveContainer.append(elSelf);

    moveContainer.style.position = 'absolute';
    moveContainer.style.zIndex = '8';

    document.body.append(moveContainer);

    // centers the ball at (pageX, pageY) coordinates
    function moveAt(pageX: number, pageY: number) {
      moveContainer.style.left = pageX - shiftX + 'px';
      moveContainer.style.top = pageY - shiftY + 'px';
    }

    // move our absolutely positioned ball under the pointer
    moveAt(event.pageX, event.pageY);

    currentDroppable = null;

    function detectBelow(event: any) {
      moveContainer.hidden = true; // will always detect self if not hidden
      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      moveContainer.hidden = false;

      if (!elemBelow) return;

      let isDropOnPlaceHolder = false;
      let droppableBelow: any = elemBelow;
      if (elemBelow.classList.contains('mdnd-placeholder')) {
        isDropOnPlaceHolder = true;
        console.log('isDropOnPlaceHolder', isDropOnPlaceHolder);
      } else {
        droppableBelow = elemBelow.closest('.mdnd-item');
      }

      if (getNodeListIndex(droppableBelow) > getNodeListIndex(placeHolder)) {
        droppableBelow?.parentNode.insertBefore(placeHolder, droppableBelow.nextSibling); // insert after
      } else {
        droppableBelow?.parentNode.insertBefore(placeHolder, droppableBelow);
      }
    }

    function onMouseMove(event: any) {
      if (isTouch) {
        event = event.targetTouches[0];
      }
      moveAt(event.pageX, event.pageY);
      detectBelowDebounced(event);
    }

    const detectBelowDebounced = debounce((event: any) => detectBelow(event));

    // (2) move the ball on mousemove
    if (isTouch) document.addEventListener('touchmove', onMouseMove);
    else document.addEventListener('mousemove', onMouseMove);

    // (3) drop the ball, remove unneeded handlers
    moveContainer.onmouseup = function () {
      if (isTouch) document.removeEventListener('touchmove', onMouseMove);
      else document.removeEventListener('mousemove', onMouseMove);
      moveContainer.onmouseup = null;
      moveContainer.remove();
      placeHolder.parentNode.insertBefore(elSelf, placeHolder);
      placeHolder.remove();
      // preventing double placeholder bug
      setTimeout(() => {
        placeHolder?.remove();
        (elSelf.parentNode as HTMLElement).querySelectorAll('.mdnd-placeholder').forEach((el) => el.remove());
      }, 11);
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
