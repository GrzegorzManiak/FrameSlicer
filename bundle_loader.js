const bundle_stats = './webpack_bundles/webpack-stats.json';
const root = './webpack_bundles/'

function load_scripts_from_bundle(bs) {

    // -- Get the names of all the scripts in the bundle
    //    as the path variable is the absolute.
    const scripts = bs.chunks.main.map(
        chunk => bs.assets[chunk]);
    

    // -- Simple script loader that just creates a script
    //    and appends it to the bottom of the body.
    const load_script = (src) =>  new Promise((resolve, reject) => {
        console.log(`Loading script: `, src['name']);

        // -- Create the script element
        const script = document.createElement('script');
        document.body.appendChild(script);

        // -- Set the attributes
        script.src = root + src['name'];
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;

        // -- Some id stufs
        script.setAttribute('data-name', src['name']);
        script.setAttribute('data-path', src['path']);
    });
  

    // -- Load all the scripts in the bundle
    //    and log a message when they are all loaded.
    const load_all = async () => {
        console.log('Loading scripts...');
        for (const src of scripts) { load_script(src); }
        console.log('All scripts loaded successfully.');
    };
  

    // -- Start the loading process
    load_all();
}
  

// -- Function that downloads the bundle stats and then 
//    loads the scripts from the bundle.
async function load_bundle() {
    fetch(bundle_stats)
        .then(response => response.json())
        .then(load_scripts_from_bundle);
}

// -- Start the loading process
load_bundle();