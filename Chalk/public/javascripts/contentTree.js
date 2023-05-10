//CHATGPT code

// Define a function to generate the directory tree as an HTML unordered list
function generateTree(node, parent) {
  const listItem = $('<li>').text(node.name);
  parent.append(listItem);

  if (node.children) {
    const childList = $('<ul>');
    node.children.forEach(child => {
      const childListItem = $('<li>').text(child.name);
      if (child.type === 'directory') {
        childListItem.addClass('directory');
        generateTree(child, childList);
      }
      childListItem.append(childList);
      listItem.append(childListItem);
    });
  }
}

// Make a request to the server to retrieve the directory tree as a JSON object
$.getJSON('/get-directory-tree')
  .done(function(data) {
    // Preload all subdirectory contents
    preloadSubdirectoryContents(data);

    // Use the JavaScript object to generate the directory tree in the browser
    const rootNode = $('<ul>');
    generateTree(data, rootNode);
    $('body').append(rootNode);

    // Add event listeners to directory list items to allow navigation
    const directoryItems = $('.directory');
    directoryItems.on('click', function(event) {
      event.stopPropagation();
      toggleSubdirectoryContents($(this));
    });
  })
  .fail(function(error) {
    console.error(error);
  });

// Recursively preload the contents of all subdirectories, should maybe have a max 
function preloadSubdirectoryContents(node) {
  if (node.children) {
    node.children.forEach(child => {
      if (child.type === 'directory') {
        $.getJSON(`/get-directory-contents?path=${encodeURIComponent(child.path)}`)
          .done(function(data) {
            child.children = data;
            preloadSubdirectoryContents(child);
          })
          .fail(function(error) {
            console.error(error);
          });
      }
    });
  }
}

// Toggle the visibility of subdirectory contents
function toggleSubdirectoryContents(directoryItem) {
  const childList = directoryItem.find('ul');
  if (childList.length) {
    childList.toggleClass('hidden');
  } else {
    const directoryPath = directoryItem.text();
    const childList = $('<ul>');
    directoryItem.append(childList);
    $.getJSON(`/get-directory-contents?path=${encodeURIComponent(directoryPath)}`)
      .done(function(data) {
        data.forEach(child => {
          const childListItem = $('<li>').text(child.name);
          if (child.type === 'directory') {
            childListItem.addClass('directory');
          }
          childList.append(childListItem);
        });
      })
      .fail(function(error) {
        console.error(error);
      });
  }
}
