window.canvasZoom = function (mediaSource) {
    var container = mediaSource.parentNode,
        videoWidth = mediaSource.videoWidth,
        videoHeight = mediaSource.vidoeHeight,
        canvas = document.createElement('canvas'),
        thumbnail = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        ctx2 = thumbnail.getContext('2d'),
        ranger = document.createElement('input'),
        cRect = mediaSource.getBoundingClientRect(),
        cW = cRect.width,
        cH = cRect.height,
        ratio = 1,
        max = 7,
        speed = 0.05,
        isDragging = false,
        previousEvent,
        sx = 0,
        sy = 0,
        timer,
        obj = {};


    function onWheel (e) {
        /**
         * wheel event handler
         * updates the beginning vertax and ratio of zoom by event
         */
        var deltaY = e.deltaY,
            scroll = 0,
            nextRatio,
            adjustment;

        if (deltaY < 0) {  // zoom in
            scroll = speed;
        } else {
            scroll = -1 * speed;
        }

        nextRatio = Math.min(max, Math.max(1, 1 * ratio + scroll));
        adjustment = (nextRatio - ratio) / (ratio * nextRatio);

        sx = 1 * sx + e.layerX / cW * videoWidth * adjustment;
        sy = 1 * sy + e.layerY / cH * videoHeight * adjustment;

        if (nextRatio == 1) {
            thumbnail.style.display = 'none';
            ranger.style.display = 'none';
        } else {
            thumbnail.style.display = 'inline';
            ranger.style.display = 'inline';
        }

        ranger.value = nextRatio;
        ratio = ranger.value;
    }

    function draggable (e) {
        e.preventDefault();
        isDragging = true;
        previousEvent = e;
    }

    function drag (e) {
        var rect = container.getBoundingClientRect();
        e.preventDefault();
        if (isDragging) {
            sx += (previousEvent.layerX - e.layerX) / rect.width * videoWidth / ratio;
            sy += (previousEvent.layerY - e.layerY) / rect.height * videoHeight / ratio;
            previousEvent = e;
        }
    }

    function removeDrag (e) {
        e.preventDefault();
        isDragging = false;
    }

    function getScaledPos () {
        sx = Math.max(0, sx);
        sy = Math.max(0, sy);
        if (videoWidth - videoWidth / ratio < sx) {
            sx = videoWidth - videoWidth / ratio;
        }
        if (videoHeight - videoHeight / ratio < sy) {
            sy = videoHeight - videoHeight / ratio;
        }
    }

    function componentWillUnmount (e) {
        stopTimer();
        mediaSource.removeEventListener('playing', resizeComponent);
        container.removeEventListener('mousedown', stopBubbling);
        container.removeEventListener('resize', resizeComponent);
        container.removeChild(canvas);
        container.removeChild(thumbnail);
        container.removeChild(ranger);
        mediaSource.style.display = '';
        return;
    }

    function stopTimer () {
        console.log(timer);
        clearInterval(timer);
    }

    function resizeComponent (evt) {
        if (evt) {
            console.log(evt.type);
        }
        setDimensions();
        setStyles();
    }

    function setDimensions () {
        console.log('set canvas dimensions');
        var prevWidth = videoWidth,
            prevHeight = videoHeight;
        videoWidth = mediaSource.videoWidth;
        videoHeight = mediaSource.videoHeight;
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        thumbnail.width = videoWidth;
        thumbnail.height = videoHeight;
        if (prevWidth && prevHeight) {
            sx = sx / prevWidth * videoWidth;
            sy = sy / prevHeight * videoHeight;
        }
        ranger.min = 1;
        ranger.max = 7;
    }

    function setStyles () {
        cRect = container.getBoundingClientRect();
        cW = cRect.width;
        cH = cRect.height;
        //canvas.style.width = cW + 'px';
        canvas.style.width = '100%';

        thumbnail.style.width = '13%';
        thumbnail.style.position = 'absolute';
        thumbnail.style.top = '20px';
        thumbnail.style.right = '30px';

        ranger.style.position = 'absolute';
        ranger.style.width = '120px';
        ranger.style.top = '120px';
        ranger.style.left = '-40px';
        ranger.style.transform = 'rotate(270deg)';
    }

    function stopBubbling (evt) {
        if (/input/i.test(evt.target.tagName)) {
            return true;
        }
        evt.stopPropagation();
        evt.preventDefault();
    }

    mediaSource.addEventListener('playing', resizeComponent);

    // stop bubbling
    container.addEventListener('mousedown', stopBubbling);
    container.addEventListener('resize', resizeComponent);

    // append canvas and ranger elements to container
    container.appendChild(canvas);
    container.appendChild(thumbnail);
    container.appendChild(ranger);

    // hide media source
    mediaSource.style.display = 'none';

    ranger.type = 'range';
    ranger.step = speed;
    ranger.value = 1;
    ranger.addEventListener('input', function (e) {
        ratio = e.target.value;
    });

    resizeComponent();

    canvas.addEventListener('wheel', onWheel, false);
    canvas.addEventListener('mousedown', draggable, false);
    canvas.addEventListener('mousemove', drag, false);
    canvas.addEventListener('mouseup', removeDrag, false);
    canvas.addEventListener('mouseout', removeDrag, false);

    timer = setInterval(function () {
        var sWidth = videoWidth / ratio,
            sHeight = videoHeight / ratio;
        getScaledPos();
        ctx.drawImage(mediaSource, sx, sy, sWidth, sHeight, 0, 0, videoWidth, videoHeight);
        ctx2.drawImage(mediaSource, 0, 0);
        ctx2.fillStyle = 'rgba(255, 255, 255, .8)';
        ctx2.fillRect(0, 0, videoWidth, videoHeight);
        ctx2.fillStyle = 'rgba(100, 100, 100, .8)';
        ctx2.fillRect(sx, sy, sWidth, sHeight);
    }, 30);

    obj.terminate = componentWillUnmount;
    obj.getData = function () {
        return [sx, sy, ratio]
    }
    obj.setData = function (arr) {
        sx = arr[0];
        sy = arr[1];
        ratio = arr[2];
    }

    return obj;
}
