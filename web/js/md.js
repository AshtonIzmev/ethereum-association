$('document').ready(function(){
    var lang = 'fr';
    $.getJSON("content/translations.json", function(json) {
        Object.keys(json).forEach(function(key) {
            $(".i18n-"+key).text(json[key][lang]);
          })
    });
});