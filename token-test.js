const evaluation = async function () {

    // test mass documents in browser, result: 3sec for 100M values
    let massLen = 100000000;
    console.log("creating data set with " + massLen + " values")
    let start = new Date().getTime();   // Remember when we started
    let mass = [];
    let result = [];
    let rand = 0;
    for (let i = 0; i < massLen; i++) {
        rand = Math.floor(Math.random() * 10);
        mass.push(rand);
        // console.log(rand)
    }
    console.log("finish creating dataset, processing now")
    for (let i = 0; i < massLen; i++) {
        if (mass[i] == 1) result.push(mass[i]);
    }
    let end = new Date().getTime(); // Remember when we finished
    console.log(end - start);   // Now calculate and output the difference
    console.log("finish processing, found " + result.length + " matching values")

}