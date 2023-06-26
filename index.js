
import fs, { lstat } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';


const isFile = (_path) => {
  return !!path.extname(_path)
}

const exist = async (_path) => {
  try{
    await fs.promises.stat(_path)
    return true
  }
  catch{
    return false
  }
}

const lsSort = {
  'directory' : 1,
  'file' : 2
}

const obj = {
  rootPath : 'C://',
  currentPath: ['Users', 'User'],
};

const objProxy = new Proxy(obj, {
  set : async function(o, p, v){
    // v = v.join(' ')
    const abs = v.startsWith('/')
    if(await exist(abs? path.join(obj.rootPath, v) : path.join(obj.rootPath, ...o[p], v))){
      o[p] = abs? [v] : [...o[p], v]
      console.log(`You are currently in ${path.join(obj.rootPath, ...o[p])}`);
    }else{
      console.log('Operation failed')
    }
    return true;
  }
})

const argsv = process.argv;
let username;
const welcome = (arg) => {
  username = arg.find((x) => x.startsWith('--username'));
  username = username ? username.split(/\=/)[1] : 'username';
  console.log(`Welcome to the File Manager, ${username}!`);
  console.log(`You are currently in ${path.join(obj.rootPath, ...obj.currentPath)}`);
};
// console.log(argsv)

const dir = () => {
  //   const currentPath = ['C:', 'Users', 'User'];

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return {
    __filename,
    __dirname,
    // currentPath,
  };
};


const readdirF = async (_path) => {
  return await fs.promises.readdir(_path)
}

const x = () => {
  process.stdin.on('data', async (str) => {
    let s = str.toString().trim();
    if (s === '.exit') {
      process.exit(0);
    }

    if (s === 'Up') {
      // const p = obj.currentPath.length > 1 ? obj.currentPath.slice(0, -1) : obj.currentPath;
      objProxy.currentPath = '../'
      return;
      // const files = await fs.promises.readdir(path.join(obj.rootPath, ...obj.currentPath));
      // console.log(files);
    }

    if(s.startsWith('cd')){
      const _path = s.split(/\s/).slice(1).join(' ')
      objProxy.currentPath = _path
      return;
      // console.log(await exist(_path), await readdirF(path.join(...obj.currentPath, _path)), path.join(...obj.currentPath, _path))

    }

    if(s.startsWith('add')){
      const fileName = s.split(' ')[1]
      try{
        if(!isFile(fileName)) throw new Exception();
        await fs.promises.writeFile(path.join(obj.rootPath, ...obj.currentPath, fileName), '')
        // console.log(isFile(fileName))
      } catch{
        console.log('error, its not a file')
      }
    }

    if(s === 'ls'){
      const files = await fs.promises.readdir(path.join(obj.rootPath, ...obj.currentPath), {withFileTypes:true});
      files.forEach(x=>{
        x.type = isFile(x.name) ? 'file' : 'directory'
      })
      files.sort((a,b)=>a.name.localeCompare(b.name) && lsSort[a.type] - lsSort[b.type])
      console.table(files)
    }

    if(s.startsWith('cat')){
      try{
        const _path = s.split(' ')[1]
        const rstream = fs.createReadStream(path.join(obj.rootPath, ...obj.currentPath, _path))

        rstream
        .on('data', function (chunk) {
          process.stdout.write(chunk.toString())
          // rstream.destroy();
        })
    
        .on('end', () => {
          console.log("ended");
        })
        .on('close', () => {
          console.log("closed");
        });

      } catch{
        console.log('please write the correct path_to_file')
      }
    }


    if(s.startsWith('rn')){
      try{
        const [from, to] = s.split(' ').slice(1)
        await fs.promises.rename(path.join(obj.rootPath, ...obj.currentPath, from), path.join(obj.rootPath, ...obj.currentPath, to))
      } catch{
        console.log('rename go wrong')
      }
    }

    // if(s){
    //   return;
    // }

    // console.log(`You are currently in ${path.join(...obj.currentPath)}`);
  });
  process.on('SIGINT', function () {
    process.exit(0);
  });

  process.on('exit', (code) => {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  });
};

welcome(argsv);
x();
