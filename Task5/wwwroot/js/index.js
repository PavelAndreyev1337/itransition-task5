window.addEventListener('load', () => {
    const states = {
        default: "default",
        text: "text",
        note: "note",
        drawing: "drawing",
        eraser: "eraser"
    }
    Object.freeze(states)
    let state = states.default
    const canvas = new fabric.Canvas("board")
    canvas.hoverCursor = 'pointer'
    canvas.setWidth(1600)
    canvas.setHeight(900)
    canvas.setDimensions({ width: "100%", height: "100%" }, { cssOnly: true })
    const connection = new signalR.HubConnectionBuilder().withUrl("/canvas").build()
    const elementTypes = {
        text: "i-text",
        note: "image",
        drawing: "path"
    }
    Object.freeze(elementTypes)

    const scaleNoteElement = (noteElement, height, width) => {
        noteElement.scaleToHeight(height)
        noteElement.scaleToWidth(width)
    }

    const createElement = elementData => {
        if (elementData.elementType === elementTypes.text) {
            const newTextElement = new fabric.IText(elementData.text, {
                id: elementData.id,
                left: elementData.left,
                top: elementData.top,
                fontSize: 20,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
            })
            canvas.add(newTextElement)
            canvas.setActiveObject(newTextElement)
        } else if (elementData.elementType === elementTypes.note) {
            let newNoteElement = new fabric.Image(document.getElementById("note"), {
                id: elementData.id,
                left: elementData.left,
                top: elementData.top,
                lockRotation: true
            })
            if (elementData.height && elementData.width) {
                scaleNoteElement(newNoteElement, elementData.height, elementData.width)
            }
            canvas.add(newNoteElement)
        } else if (elementData.elementType === elementTypes.drawing) {
            canvas.add(new fabric.Path(elementData.path, {
                id: elementData.id,
                left: elementData.left,
                top: elementData.top,
                fill: '',
                stroke: 'black',
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true
            }))
        }
    }

    connection.on("InitialDraw", elements => {
        elements.forEach(element => createElement(element))
    })

    connection.on("ReceiveDraw", elementData => {
        createElement(elementData)
    })

    const getCreatedElementById = id => {
        return canvas.getObjects().find(element => element.id === id)
    }

    connection.on("ReceiveRemovedElement", removedElement => {
        canvas.remove(getCreatedElementById(removedElement.id))
    })

    connection.on("ReceiveUpdatedElement", updatedElement => {
        console.log(updatedElement)
        let element = getCreatedElementById(updatedElement.id)
        element.text = updatedElement.text
        element.top = updatedElement.top
        element.left = updatedElement.left
        element.setCoords()
        if (element.type === elementTypes.note) {
            scaleNoteElement(element, updatedElement.height, updatedElement.width)
        } else if (element.type === elementTypes.path) {
            element.path = updatedElement.path
        }
        canvas.requestRenderAll()
        canvas.discardActiveObject()
    })

    connection.start()
        .then(() => {
            connection.invoke("GetElemenets").catch(err => console.log(err))
        }).catch(err => console.log(err))

    Array.from(document.getElementsByClassName("nav-item")).forEach(element => {
        element.addEventListener("click", event => {
            canvas.discardActiveObject()
            canvas.renderAll()
            const targetClassName = "active"
            const tragetElement = event.target
            if (state !== states.drawing) {
                canvas.isDrawingMode = false
            } else {
                canvas.isDrawingMode = true;
            }
            if (tragetElement.classList.contains(targetClassName)) {
                tragetElement.classList.remove(targetClassName)
                state = states.default
                canvas.isDrawingMode = false
            } else {
                Array.from(document.getElementsByClassName(targetClassName)).forEach(element => {
                    element.classList.remove(targetClassName)
                })
                tragetElement.classList.add(targetClassName)
            }
        })
    })

    const invokeElementUpdating = targetElement => {
        let options = {
            id: targetElement.id,
            elementType: targetElement.type,
            text: targetElement.text,
            top: targetElement.top,
            left: targetElement.left,
            height: targetElement.getScaledHeight(),
            width: targetElement.getScaledWidth(),
        }
        if (targetElement.type === elementTypes.drawing) {
            options.path = targetElement.path.toString()
        }
        connection.invoke("UpdateElement", options)
    }

    canvas.on("text:changed", e => {
        invokeElementUpdating(e.target);
    })

    canvas.on("object:moved", e => {
        invokeElementUpdating(e.target);
    })

    canvas.on("object:scaled", e => {
        invokeElementUpdating(e.target);
    })

    canvas.on('path:created', e => {
        const createdPath = e.path
        if (createdPath.width <= 0.1 && createdPath.height <= 0.1) {
            canvas.remove(e.path)
        } else {
            connection.invoke("AddDraw", {
                elementType: elementTypes.drawing,
                left: createdPath.left,
                top: createdPath.top,
                path: createdPath.path.toString()
            })
            canvas.remove(e.path)
        }
    })

    const invokeAddingDraw = (left, top) => {
        connection.invoke("AddDraw", {
            elementType: elementTypes.text,
            text: "Text",
            left: left,
            top: top
        })
    }

    canvas.on("mouse:down", options => {
        let pointer = canvas.getPointer(options.e)
        const targetElement = options.target;
        if (targetElement) {
            if (state === states.eraser) {
                connection.invoke("RemoveElement", {
                    id: targetElement.id
                })
            } else if (state === states.text && targetElement.isType("image")) {
                invokeAddingDraw(pointer.x, pointer.y)
            }
            if (state === states.text) {
                targetElement.editable = true
            } else {
                targetElement.editable = false
            }
        } else {
            if (state === states.text) {
                invokeAddingDraw(pointer.x, pointer.y)
            } else if (state === states.note) {
                connection.invoke("AddDraw", {
                    elementType: elementTypes.note,
                    top: pointer.y,
                    left: pointer.x
                })
            }
        }
    })

    document.getElementById("textTool").addEventListener("click", () => {
        state = states.text
    })

    document.getElementById("noteTool").addEventListener("click", () => {
        state = states.note
    })

    document.getElementById("drawingTool").addEventListener("click", () => {
        state = states.drawing
    })

    document.getElementById("eraserTool").addEventListener("click", () => {
        state = states.eraser
    })
})
