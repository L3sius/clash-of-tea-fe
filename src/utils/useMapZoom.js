import panzoom from 'panzoom';

export function useMapZoom() {
  let panzoomInstance = null;

  const initialize = (mapSceneElement) => {
    if (!mapSceneElement || panzoomInstance) return;

    panzoomInstance = panzoom(mapSceneElement, {
      maxZoom: 2.5,
      minZoom: 1,
      bounds: true,
      boundsPadding: 0.1,
      smoothScroll: true,
      beforeMouseDown: () => {
        const transform = panzoomInstance.getTransform();
        return transform.scale <= 1;
      },
      onTouch: () => {
        const transform = panzoomInstance.getTransform();
        return transform.scale <= 1;
      }
    });

    panzoomInstance.on('zoom', () => enforceZoomBounds(mapSceneElement));
    centerImage();
  };

  let isEnforcing = false;

const enforceZoomBounds = (mapSceneElement) => {
  if (!panzoomInstance || isEnforcing) return;
  
  isEnforcing = true;
  const transform = panzoomInstance.getTransform();

  if (mapSceneElement) {
    if (transform.scale > 1) {
      mapSceneElement.classList.add('can-pan');
    } else {
      mapSceneElement.classList.remove('can-pan');
    }
  }

  if (transform.scale <= 1) {
    panzoomInstance.smoothMoveTo(0, 0);
    panzoomInstance.smoothZoom(0, 0, 1);
  }
  
  isEnforcing = false;
};

  const enforcePanLimits = (mapSceneElement) => {
    if (!panzoomInstance || !mapSceneElement) return;

    const transform = panzoomInstance.getTransform();
    const scale = transform.scale;

    if (scale <= 1) return;

    const scene = mapSceneElement;
    const img = scene.querySelector('img');
    if (!img) return;

    const imgRect = img.getBoundingClientRect();
    const containerRect = scene.parentElement.getBoundingClientRect();

    const scaledWidth = imgRect.width * scale;
    const scaledHeight = imgRect.height * scale;

    const maxPanX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const maxPanY = Math.max(0, (scaledHeight - containerRect.height) / 2);

    let newX = transform.x;
    let newY = transform.y;

    if (Math.abs(newX) > maxPanX) {
      newX = newX > 0 ? maxPanX : -maxPanX;
    }

    if (Math.abs(newY) > maxPanY) {
      newY = newY > 0 ? maxPanY : -maxPanY;
    }

    if (newX !== transform.x || newY !== transform.y) {
      panzoomInstance.moveTo(newX, newY);
    }
  };

  const centerImage = () => {
    if (panzoomInstance) {
      panzoomInstance.moveTo(0, 0);
      panzoomInstance.zoomAbs(0, 0, 1);
    }
  };

  const zoomIn = (mapSceneElement) => {
    if (!panzoomInstance || !mapSceneElement) return;

    const rect = mapSceneElement.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    panzoomInstance.smoothZoom(centerX, centerY, 1.3);
  };

  const zoomOut = (mapSceneElement) => {
    if (!panzoomInstance || !mapSceneElement) return;

    const rect = mapSceneElement.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    panzoomInstance.smoothZoom(centerX, centerY, 1 / 1.3);
  };

  const resetZoom = () => {
    if (panzoomInstance) {
      panzoomInstance.moveTo(0, 0);
      panzoomInstance.zoomAbs(0, 0, 1);
    }
  };

  const dispose = () => {
    if (panzoomInstance) {
      panzoomInstance.dispose();
      panzoomInstance = null;
    }
  };

  return {
    initialize,
    zoomIn,
    zoomOut,
    resetZoom,
    dispose
  };
}