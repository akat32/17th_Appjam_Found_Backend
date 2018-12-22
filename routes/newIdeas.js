module.exports = newIdeas

function newIdeas(app, Ideas, Users, rndstring, multer) {
  var storage = multer.diskStorage({
    destination: (req,file,cb)=>{
      cb(null, '/home/ubuntu/17th_Appjam_Found/public/idea'); //C:\\Users\\parktea\\Desktop\\17Appjam\\public
    },
    filename: (req,file,cb)=>{
      var newStr = rndstring.generate(33);
      newStr = newStr + ".PNG"
      cb(null, newStr);
    },
    limits: {
      fileSize: 5 * 1024 * 1024
    }
  })
  const upload = multer({storage : storage});
  app.post('/newIdea', async(req,res)=>{
    let json = {
      profileImg : req.body.profileImg,
      category : req.body.category,
      name : req.body.name,
      title : req.body.title,
      index : req.body.index,
      userToken : req.body.userToken,
      token : rndstring.generate(22)
    }
    json = new Ideas(json)
    let result = await json.save()
    let jsonToken = { token : json.token}
    result = await Users.update({token : req.body.userToken}, {
      $push : {ideaList : jsonToken}
    })
    if(!result.ok) return res.status(500).json({message : "ERR!"})
    res.status(200).json({message: "success!"})
  })
  .post('/addIdeaImg', upload.single('img'), async (req,res)=>{
    let json = { link : "http://18.222.180.31:3000/idea/" + req.file.filename}
    let result = await Ideas.update({token : req.body.token}, {
      $push : {img : json}
    })
    if(!result.ok) return res.status(500).json({message : "ERR!"})
    return res.status(200).json({message : "success!"})
  })
  .post('/ideaList', async (req,res)=>{
    let result = await Ideas.find()
    res.status(200).json({list : result})
  })
  .post('/addreply', async (req,res)=>{
    let json = {
      index : req.body.index,
      profileImg : req.body.profileImg,
      name : req.body.name
    }
    let result = await Ideas.update({token : req.body.token}, {
      $push : {reply : json}
    })
    if(!result.ok) return res.status(500).json({message : "ERR!"})
    return res.status(200).json({message : "success!"})
  })
  .post('/myIdeaList', async (req,res)=>{
    let result = await Users.findOne({token : req.body.token})
    result = result.ideaList
    let list = []
    for(var i=0; result[i] != null; i++) {
      let idea = await Ideas.findOne({token : result[i].token})
      if(idea) list.push(idea)
    }
    res.status(200).json({list : list})
  })
  .post('/returnIdea', async (req,res)=>{
    let result = Ideas.findOne({token : req.body.token})
    if(!result) return res.status(404).json({message : "Not found!"})
    else return res.status(200).json({idea : result})
  })
}
