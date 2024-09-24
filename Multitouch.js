class TouchSpriteExtension {
    constructor() {
        this.touchPositions = {}; // Object to store touch positions per touch ID
        this.stageWidth = 640; // Default stage width
        this.stageHeight = 480; // Default stage height

        // Attach event listeners for touch events
        window.addEventListener('touchstart', (event) => this.handleTouchEvent(event), { passive: true });
        window.addEventListener('touchmove', (event) => this.handleTouchEvent(event), { passive: true });
        window.addEventListener('touchend', (event) => this.handleTouchEnd(event), { passive: true });
        window.addEventListener('touchcancel', (event) => this.handleTouchEnd(event), { passive: true });
    }

    getInfo() {
        return {
            id: 'touchSpriteExtension',
            name: 'Touch Sprite Detector',
            blocks: [
                {
                    opcode: 'isTouchingSprite',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: 'finger touching sprite?',
                    arguments: {}
                },
                {
                    opcode: 'distanceToClosestFinger',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'distance to closest finger',
                    arguments: {}
                },
                {
                    opcode: 'closestFingerX',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'x of closest finger',
                    arguments: {}
                },
                {
                    opcode: 'closestFingerY',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'y of closest finger',
                    arguments: {}
                },
                {
                    opcode: 'setStageSize',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'set stage size width: [WIDTH] height: [HEIGHT]',
                    arguments: {
                        WIDTH: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 640
                        },
                        HEIGHT: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 480
                        }
                    }
                },
                {
                    opcode: 'getStageWidth',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'stage width',
                    arguments: {}
                },
                {
                    opcode: 'getStageHeight',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'stage height',
                    arguments: {}
                }
            ]
        };
    }

    handleTouchEvent(event) {
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();

        for (let touch of event.touches) {
            const touchId = touch.identifier;
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;

            // Convert to Scratch coordinate system for dynamically set stage size
            const scratchX = (touchX / rect.width) * this.stageWidth - (this.stageWidth / 2);
            const scratchY = (this.stageHeight / 2) - (touchY / rect.height) * this.stageHeight;

            // Update touch positions
            this.touchPositions[touchId] = { x: scratchX, y: scratchY };
        }

        // Remove touch positions that are no longer active
        for (let touchId in this.touchPositions) {
            if (![...event.touches].find(t => t.identifier === parseInt(touchId))) {
                delete this.touchPositions[touchId];
            }
        }
    }

    handleTouchEnd(event) {
        for (let touch of event.changedTouches) {
            const touchId = touch.identifier;
            delete this.touchPositions[touchId];
        }
    }

    isTouchingSprite(args, util) {
        const target = util.target; // Current sprite or clone
        const bounds = target.getBounds(); // Get the sprite/clone bounds

        for (let touchId in this.touchPositions) {
            const position = this.touchPositions[touchId];
            if (
                position.x >= bounds.left &&
                position.x <= bounds.right &&
                position.y >= bounds.bottom &&
                position.y <= bounds.top
            ) {
                return true;
            }
        }
        return false;
    }

    distanceToClosestFinger(args, util) {
        const target = util.target; // Current sprite or clone
        let minDistance = Infinity;

        for (let touchId in this.touchPositions) {
            const position = this.touchPositions[touchId];
            const distance = Math.sqrt(
                Math.pow(position.x - target.x, 2) +
                Math.pow(position.y - target.y, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
            }
        }

        return minDistance === Infinity ? -1 : minDistance;
    }

    closestFingerX(args, util) {
        const closestFinger = this.getClosestFinger(util.target);
        return closestFinger ? closestFinger.x : 0;
    }

    closestFingerY(args, util) {
        const closestFinger = this.getClosestFinger(util.target);
        return closestFinger ? closestFinger.y : 0;
    }

    getClosestFinger(target) {
        let minDistance = Infinity;
        let closestFinger = null;

        for (let touchId in this.touchPositions) {
            const position = this.touchPositions[touchId];
            const distance = Math.sqrt(
                Math.pow(position.x - target.x, 2) +
                Math.pow(position.y - target.y, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestFinger = position;
            }
        }

        return closestFinger;
    }

    setStageSize(args) {
        this.stageWidth = parseFloat(args.WIDTH);
        this.stageHeight = parseFloat(args.HEIGHT);
    }

    getStageWidth(args) {
        return this.stageWidth;
    }

    getStageHeight(args) {
        return this.stageHeight;
    }
}

Scratch.extensions.register(new TouchSpriteExtension());
