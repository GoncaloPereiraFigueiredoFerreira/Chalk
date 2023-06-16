/*
function addTag(){
    var div = document.getElementById('tags_div')
    var input = document.getElementById('tag')

    const newSpan = document.createElement('span')
    newSpan.id = input.value
    newSpan.className = "m-1 flex flex-wrap justify-between items-center text-xs bg-gray-200 rounded px-4 py-2 font-bold leading-loose cursor-pointer sm:text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
    newSpan.textContent = input.value
    newSpan.setAttributeNS(null, 'onClick', 'removeTag()')

    newSvg = document.createElement('svg')
    newSvg.className = "w-3 h-3 ml-4 text-gray-500 sm:h-4 sm:w-4 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
    newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    newSvg.setAttributeNS('', "viewBox", "20 20 0 0")
    newSvg.setAttribute('fill', 'currentColor')

    newPath = document.createElement('path')
    newPath.setAttribute('fill-rule', 'evenodd')
    newPath.setAttribute('d', 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z')
    newPath.setAttribute('clip-rule', 'evenodd')

    var newBtn = document.createElement('button')
    newBtn.setAttribute('type', 'button')
    newBtn.setAttributeNS(null, 'onClick', 'removeTag()')
    newBtn.setAttribute('class', 'text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800')
    newBtn.textContent = input.value
    newBtn.id = input.value

    input.value = ''
    //newSvg.appendChild(newPath)
    //newSpan.appendChild(newSvg)
    div.appendChild(newBtn)
}
*/

nrTags = 0


// TODO: reallocate ids
function addTag(){
    var input = document.getElementById('tag')
    if (input.value !== ''){
        nrTags += 1
        var form = document.getElementById('form')

        /*
        var newElement = document.createElement('div')
        newElement.setAttributeNS(null, 'class', "flex items-center w-full max-w-xs p-4 text-gray-500 bg-white.rounded-lg shadow dark:text-gray-400 dark:bg-gray-800")

        var child = document.createElement('div')
        child.setAttributeNS(null, 'class', "ml-3 text-sm font-normal")
        child.textContent = input.value

        var button = document.createElement('button')
        button.setAttribute('type', 'button')
        button.setAttributeNS(null, 'onClick', 'removeTag()')
        button.setAttributeNS(null, 'class', 'ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700')

        var svg = document.createElement('svg')
        svg.setAttribute('aria-hidden', 'true')
        svg.setAttribute('class', 'w-5 h-5')
        svg.setAttribute('fill', 'currentColor')
        svg.setAttributeNS(null, 'viewBox', '0 0 20 20')
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

        var path = document.createElement('path')
        path.setAttribute('fill-rule', 'evenodd')
        path.setAttribute('d', "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z")
        path.setAttribute('clip-rule', "evenodd")
        
        svg.appendChild(path)
        button.appendChild(svg)
        newElement.appendChild(child)
        newElement.appendChild(button)
        */

        var new_input = document.createElement('input')
        new_input.type = 'hidden'
        new_input.id = 'tag' + nrTags
        new_input.name = 'tag' + nrTags
        new_input.value = input.value

        input.value = ''
        form.appendChild(new_input)
    }
}

function removeTag(){
    console.log('removing tag')
}