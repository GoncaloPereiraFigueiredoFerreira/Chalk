function getSideChannels(){
    
  fetch("/sidebar").then(result=>{
        result.json().then(result=>{
          $("#dropdown-sub").empty()
          for(let sub of result.subchannels){
            let li= $("<li>")
            let a =$('<a>').attr("href","/channel/"+sub._id).attr("class","flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700").text(sub.name)
            $("#dropdown-sub").append(li.append(a))
          }
          $("#dropdown-pub").empty()
          for(let sub of result.pubchannels){
            let li= $("<li>")
            let a =$('<a>').attr("href","/channel/"+sub._id).attr("class","flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700").text(sub.name)
            $("#dropdown-pub").append(li.append(a))
          }
    })})

}
