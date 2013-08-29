# Adserving on your site

There are currently 2 ways to implement adserving on your site 

## Using 'responsive' method 

## Using 'append' method

The installation we use here is `education`, please replace all instances of `education` with your installation.  
Also `adspace id's` used here are taken from `education`, so replace them with `adspace id's` from your installation.

`Target's` are the `css id`'s which content are replaces with ads

`keyword` is one of the registered keywords on the adspaces. Adspaces without this keyword will ignore it. `searchword` is the search term(s) used on the page. `keyword` and `searchword` can be left out if they are irrelevant.

### Usage:

include the following at the buttom of the page

```html 
<script type="text/javascript" 
         src="http://education.adservinginternational.com/api/v2/js/appendto.js"></script>
<script type="text/javascript">
  AdServ.load({
     keyword : '',
	   searchword : '',
	   adspaces : [
	      { id : 784, target : 'target_1' },
	      { id : 787, target : 'other_target' }
	   ]
	});
</script>
```


### Dynamically:

If your site includes the adspaces dynamically, it can be done by collecting adspaces in an javascript array, like this:

```html
<!--this is the first adspace-->
<div id="target_1"></div>
<script type="text/javascript">
	var myAdspaces = myAdspaces || [];
	myAdspaces.push({id : 784, target : 'target_1'});
</script>
<h1>Lorem Ipsum</h1>

<!--Some content-->
<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis, molestias, non! Consequatur delectus in
   iure minus neque obcaecati praesentium provident quaerat repudiandae ut.</p>

<!--this is the second adspace-->
<div id="other_target"></div>
<script type="text/javascript">
	var myAdspaces = myAdspaces || [];
	myAdspaces.push({id : 787, target : 'other_target' });
</script>
```

and then include the following in the page footer

```html  
<script type="text/javascript" 
         src="http://education.adservinginternational.com/api/v2/js/appendto.js"></script>
<script type="text/javascript">
  AdServ.load({
	   keyword : 'sport',
	   adspaces : myadspaces
	});
</script>
```
