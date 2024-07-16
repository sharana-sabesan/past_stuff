Moralis.settings.setAPIRateLimit({
    anonymous:1000, authenticated:2000, windowMs:60000
  })
  /* specifies how many API request calls we can make (to access
   * info abt our NFTs) per min. We put it to a large number. 
   */