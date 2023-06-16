function getChannels(value,channels){
  return new Promise((resolve,reject)=>{
      if (channels.length==0){
            fetch("/search/"+value).then(result=>{
              result.json().then(result=>{
              resolve(result) 
      })})}
      else resolve(channels)         
  })
}

const searchInput = document.querySelector("#default-search")
let channels = []
let previous = 0
searchInput.addEventListener("input", e=>{
    const value = e.target.value.toUpperCase();
    if (value < previous) channels = []
    let shown =0
    if (value.length > 1){
        getChannels(value,channels).then(res=>{
            channels=res
            $("#dropdownlist").empty()
              shown=0
              for (let ch in channels){
                if (channels[ch].name.toUpperCase().indexOf(value)!=-1){
                    shown+=1
                    let a = $('<a>').attr("href","/channel/"+channels[ch]._id).attr("class","block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white").text(channels[ch].name)
                    $("#dropdownlist").append($('<li>').append(a))
                } 
              }
              if (shown>0) $("#dropdown").show(200)
              else $("#dropdown").hide()
        })                    
    }
    else{
      $("#dropdownlist").empty()
      $("#dropdown").hide(200)
    }
    previous=value.length

})