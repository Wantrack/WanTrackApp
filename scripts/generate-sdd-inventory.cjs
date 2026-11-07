/* Static documentation generator. Never imports or executes application code. */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const api = path.resolve(root, process.argv[2] || '../WanTrackApi');
const out = path.join(root, 'Documentation/sdd');
const unique = xs => [...new Set(xs)];
const cell = x => String(x).replace(/\|/g, '&#124;').replace(/[\r\n]+/g, ' ');
const code = x => '`' + cell(x).replace(/`/g, '') + '`';
const tracked = dir => cp.execFileSync('git', ['-C', dir, 'ls-files', '-z']).toString().split('\0').filter(Boolean);
const link = (repo, file) => `[${file}](${repo === 'app' ? '../../' : '../../../WanTrackApi/'}${file})`;
const parse = (file, text) => ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.js') ? ts.ScriptKind.JSX : ts.ScriptKind.TS);
const walk = (node, visit) => { visit(node); ts.forEachChild(node, child => walk(child, visit)); };
const routes = [], controllers = [], files = [], urls = [];
const baseline = tracked(root).filter(f => !f.startsWith('Documentation/sdd/') && !f.startsWith('scripts/') && !['AGENTS.md', 'CLAUDE.md', 'CHATGPT.md'].includes(f));
for (const file of baseline) {
 const full = path.join(root, file);
 if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) { files.push({file, kind:'Gitlink / directory; not frontend source', bytes:0}); continue; }
 const buf = fs.readFileSync(full);
 const binary = /\.(png|jpg|ico|eot|ttf|woff2?)$/.test(file);
 const r = {file, bytes:buf.length, kind:binary ? 'Binary asset; metadata only' : 'Text/configuration/asset inspected', imports:[], symbols:[], storage:[], env:[]};
 if (!binary) {
  const text = buf.toString('utf8'); r.lines = text.split('\n').length;
  if (file.endsWith('.js') && file !== 'public/sdk.js') {
   r.kind='JavaScript/JSX parsed'; const ast=parse(file,text);
   if (ast.parseDiagnostics.length) throw new Error(`Parse errors in ${file}`);
   walk(ast, n => {
    if (ts.isImportDeclaration(n)) r.imports.push(n.moduleSpecifier.text);
    if (ts.isFunctionDeclaration(n) && n.name) r.symbols.push(n.name.text);
    if (ts.isVariableDeclaration(n) && n.initializer && (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer))) r.symbols.push(n.name.getText(ast));
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)) {
     const receiver=n.expression.expression.getText(ast), method=n.expression.name.text;
     if (receiver==='localStorage' && n.arguments[0] && ts.isStringLiteral(n.arguments[0])) r.storage.push(n.arguments[0].text);
     if (receiver==='axios' && ['get','post','put','patch','delete'].includes(method)) {
      const arg=n.arguments[0]; if(arg) urls.push({file,line:ast.getLineAndCharacterOfPosition(n.getStart(ast)).line+1,method:method.toUpperCase(),expression:arg.getText(ast),kind:'request'});
     }
    }
    if ((ts.isTemplateExpression(n) || ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && n.getText(ast).includes('/api/') && n.getText(ast).length < 1000) {
     urls.push({file,line:ast.getLineAndCharacterOfPosition(n.getStart(ast)).line+1,method:'?',expression:n.getText(ast),kind:'URL reference (hook/link/conditional; inspect caller)'});
    }
   });
   r.env=unique([...text.matchAll(/process\.env\.([\w]+)/g)].map(m=>m[1]));
  } else if (file==='public/sdk.js') r.kind='Bundled third-party Meta SDK; text read, not first-party logic';
  else if (/\.css(?:\.map)?$/.test(file)) r.kind='Stylesheet / generated stylesheet map; text read';
  else if (/\.scss$/.test(file)) r.kind='SCSS styling source; text read';
 }
 files.push(r);
}
for(const file of tracked(api).filter(f=>f.endsWith('.ts'))) {
 const text=fs.readFileSync(path.join(api,file),'utf8'), ast=parse(file,text);
 if(ast.parseDiagnostics.length) throw new Error(`Parse errors in API ${file}`);
 const active=file.startsWith('src/routes/app/') || file.startsWith('src/routes/review/') || file==='src/routes/systemRoutes.ts';
 const rec={file,methods:[],imports:[],tables:[],shim:false};
 walk(ast,n=>{
  if((ts.isImportDeclaration(n)||ts.isExportDeclaration(n))&&n.moduleSpecifier)rec.imports.push(n.moduleSpecifier.text);
  if(ts.isMethodDeclaration(n) || (ts.isPropertyDeclaration(n)&&n.initializer&&(ts.isArrowFunction(n.initializer)||ts.isFunctionExpression(n.initializer)))) {
   const body=n.getText(ast);
   rec.methods.push({name:n.name.getText(ast),line:ast.getLineAndCharacterOfPosition(n.getStart(ast)).line+1,inputs:unique([...body.matchAll(/req\.(?:body|params|query|user)(?:\??\.\w+)*/g)].map(m=>m[0]))});
  }
  if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&['server','router','app'].includes(n.expression.expression.getText(ast))&&['get','post','put','patch','delete','use'].includes(n.expression.name.text)&&n.arguments[0]&&ts.isStringLiteral(n.arguments[0])) {
   const args=n.arguments.slice(1).map(a=>a.getText(ast));
   routes.push({file,line:ast.getLineAndCharacterOfPosition(n.getStart(ast)).line+1,method:n.expression.name.text.toUpperCase(),url:n.arguments[0].text,active:active||file==='src/events/index.ts',auth:args.some(a=>a.includes('authenticateUserParam'))?'URL bearer':args.some(a=>a.includes('authenticateUser'))?'Bearer middleware':'No route auth',handler:(args.join(' ').match(/\w+Controller\.\w+/g)||[]).join(', ')||'inline / mounted handler'});
  }
 });
 rec.shim=/^export\s+\{[^\n]+\}\s+from/m.test(text)&&text.trim().split('\n').length===1;
 rec.tables=unique([...text.matchAll(/\b(?:FROM|JOIN|INTO|UPDATE)\s+`?([a-zA-Z_][\w]*)/g)].map(m=>m[1])).filter(x=>!['SET','SELECT','JSON'].includes(x));
 if(/Controller\.ts$/i.test(file)||file==='src/modules/support/conversationStore.ts')controllers.push(rec);
}
const requests=urls.filter(u=>u.method!=='?'||!urls.some(v=>v.file===u.file&&v.method!=='?'&&v.expression===u.expression));
function pattern(expression) {
 let s=expression.replace(/^['"`]|['"`]$/g,'').replace(/^\$\{constants\.apiurl\}/,'');
 if(!s.startsWith('/api/'))return null;
 s=s.replace(/\$\{[^}]*\}/g,':dynamic').split('?')[0];
 return s;
}
function matches(request,route) {
 const p=pattern(request.expression);if(!p)return false;
 const a=p.toLowerCase().split('/'),b=route.url.toLowerCase().split('/');
 return (request.method==='?'||request.method===route.method)&&a.length===b.length&&a.every((x,i)=>x===b[i]||x.startsWith(':')||b[i].startsWith(':'));
}
fs.mkdirSync(out,{recursive:true});
let md='# Frontend file inventory\n\nGenerated by `node scripts/generate-sdd-inventory.cjs` from tracked frontend files. All listed text files are read; first-party JavaScript is parsed, not executed. Structural coverage does not mean every behavior is tested. Binary assets are metadata-only; dependencies, `.env`, build output and lockfiles ignored by Git are outside this index. The empty gitlink is identified explicitly.\n\n';
for(const r of files) {
 md+=`## ${r.file}\n\n- ${link('app',r.file)} — ${r.kind}; ${r.bytes} bytes${r.lines?`; ${r.lines} lines`:''}.\n`;
 for(const [key,label] of [['imports','Imports'],['symbols','Functions'],['storage','Literal localStorage keys'],['env','Environment keys']])if(r[key]?.length)md+=`- ${label}: ${unique(r[key]).map(code).join(', ')}.\n`;
 md+='\n';
}
fs.writeFileSync(path.join(out,'07-file-inventory.md'),md);
md='# Frontend/API request relationship\n\nGenerated by static AST analysis, excluding commented code. A match compares HTTP method (when known) and path segments, case-insensitively, with dynamic segments treated as wildcards. It does **not** verify payload, authorization, query-string, response shape or runtime reachability. `?` means inspect the enclosing hook, link or conditional for the verb. Multiple candidate routes are possible. Nonliteral request arguments require manual tracing. Only currently mounted route groups are matched.\n\n| Frontend source:line | Method | URL expression | Backend route → handler |\n|---|---|---|---|\n';
for(const u of requests) {
 const matched=routes.filter(r=>r.active&&matches(u,r));
 md+=`| ${link('app',u.file)}:${u.line} | ${u.method} | ${code(u.expression)} | ${matched.length?matched.map(r=>`${code(r.method+' '+r.url)} → ${code(r.handler)} (${link('api',r.file)})`).join('<br>'):'Unresolved / no static match; inspect manually'} |\n`;
}
md+='\n## Mounted backend routes\n\nMiddleware presence is not proof of role or tenant authorization. `review/` routes are mounted in production initialization. Legacy standalone router files are listed separately below. GraphQL field contracts live in `src/events/schema.ts`.\n\n| Method | Path | Auth at mount | Handler | Source:line |\n|---|---|---|---|---|\n';
for(const r of routes.filter(r=>r.active))md+=`| ${r.method} | ${code(r.url)} | ${r.auth} | ${code(r.handler)} | ${link('api',r.file)}:${r.line} |\n`;
md+='\n## Legacy declarations not mounted by current bootstrap\n\n';
for(const file of unique(routes.filter(r=>!r.active).map(r=>r.file)))md+=`- ${link('api',file)}\n`;
fs.writeFileSync(path.join(out,'08-api-relationship.md'),md);
md='# Backend controller index\n\nRead-only snapshot of sibling `WanTrackApi`, generated from TypeScript ASTs. Includes every tracked file named `*Controller.ts` and the conversation store, including compatibility exports and unmounted controllers. Method inputs are lexical references, not validation guarantees. SQL names are heuristic candidates, not a complete schema. Active route ownership is recorded in [the API relationship](08-api-relationship.md).\n\n';
for(const c of controllers) {
 md+=`## ${c.file}\n\n- ${link('api',c.file)}${c.shim?' — compatibility re-export; follow its import.':''}\n`;
 if(c.imports.length)md+=`- Dependencies: ${c.imports.map(code).join(', ')}.\n`;
 if(c.tables.length)md+=`- SQL table candidates: ${c.tables.map(code).join(', ')}.\n`;
 for(const m of c.methods)md+=`- ${code(m.name)} (line ${m.line})${m.inputs.length?': '+m.inputs.map(code).join(', '):': no direct request-field reference'}.\n`;
 md+='\n';
}
fs.writeFileSync(path.join(out,'09-controller-index.md'),md);
console.log(JSON.stringify({frontendFiles:files.length,frontendRequestsAndUrlReferences:requests.length,mountedRoutes:routes.filter(r=>r.active).length,legacyRouteDeclarations:routes.filter(r=>!r.active).length,controllerFiles:controllers.length,unmatched:requests.filter(u=>!routes.some(r=>r.active&&matches(u,r))).map(u=>({file:u.file,line:u.line,method:u.method,url:u.expression}))},null,2));
