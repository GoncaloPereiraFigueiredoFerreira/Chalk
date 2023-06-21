var nrTags = 0

// TODO: reallocate ids
function addTag(){
    let input = document.getElementById('tag')
    if (input.value !== ''){
        let value = input.value
        input.value = ''
        nrTags += 1
        let tagID = 'tag' + nrTags

        // creating hidden for storing form data
        let new_input = document.createElement('input')
        new_input.type = 'hidden'
        new_input.id = tagID
        new_input.name = tagID
        new_input.value = value

        let form = document.getElementById('form')
        form.appendChild(new_input)

        // showing tag
        let tagDiv = document.createElement('div')
        tagDiv.className = 'ml-3 text-sm font-normal'
        tagDiv.textContent = value

        console.log(tagID)
        let btn = document.createElement('button')
        btn.setAttribute('type', 'button')
        btn.className = 'ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700'
        btn.setAttribute('onClick', 'removeTag(' + nrTags + ')')
        btn.textContent = 'X'

        let widerTagDiv = document.createElement('div') 
        widerTagDiv.className = 'flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800'
        widerTagDiv.id = tagID + '_'
        widerTagDiv.appendChild(tagDiv)
        widerTagDiv.appendChild(btn)
        
        let div = document.getElementById('tags_div')
        div.appendChild(widerTagDiv)
    }
}

function removeTag(id){
    let tagID = 'tag' + id

    let tagInput = document.getElementById(tagID)
    let widerTagDiv = document.getElementById(tagID + '_')

    let form = document.getElementById('form')
    form.removeChild(tagInput)
    let div = document.getElementById('tags_div')
    div.removeChild(widerTagDiv)

    for (let i=id; i < nrTags; i++){
        let tmpTagInput = document.getElementById('tag' + (i+1))
        tmpTagInput.id = 'tag' + i
        tmpTagInput.name = 'tag' + i
        let tmpWiderTagDiv = document.getElementById('tag' + (i+1) + '_')
        tmpWiderTagDiv.id = 'tag' + i + '_'
    }

    nrTags = nrTags - 1
}