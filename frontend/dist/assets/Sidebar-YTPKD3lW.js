import{j as e,r as f}from"./vendor-Cp_li0RT.js";import{L as y,F as g,f as M,u as v,a as w,I as P,c as I,b as k,d as R,e as $,R as S,l as F,g as N,h as T,i as D,j as G,k as _,m as C,s as B,n as O,o as U,p as H,q as K,r as V,t as X,v as q,w as W,x as Y,y as z}from"./index-YWIOG9Yk.js";function m({to:s,icon:a,label:l,activeMenu:r,handleActiveMenu:x,handlePopup:t,handleHover:c,addIcon:p,categories:h=[],tags:b=[],isSidebarPinned:o,isHover:d,handleRemovedItem:n}){return e.jsxs("div",{className:"flex flex-col show-entity",children:[e.jsx(y,{to:s,onClick:()=>x(s),children:e.jsxs("div",{className:`flex justify-between py-2 pl-6 gap-4 easy-slide ${r===s?"bg-purpleActive border-r-4 border-purple-200":"bg-transparent hoverMenu"}`,children:[e.jsxs("div",{className:`flex items-center gap-4 text-2xl ${r===s?"text-white":"text-slate-400"}`,children:[a&&e.jsx(g,{icon:a}),o&&e.jsx("h1",{children:l})]}),e.jsx("button",{onClick:i=>{i.stopPropagation(),t(i)},children:o&&p&&e.jsx(g,{icon:p,className:`bg-purpleNormal border-2 border-purpleBorder text-xl\r
                 text-white mr-4 my-1 p-2 rounded-md\r
                 hover:bg-purpleBorder hover:scale-110 transition-all duration-100 ease-in-out\r
                 `})})]})}),o&&h.length>0&&e.jsx("ul",{className:"dropdown ",children:h.map(i=>e.jsx("li",{onMouseEnter:()=>c(i._id),onMouseLeave:()=>c(null),className:"hoverMenu  mb-2  text-gray-400  easy-slide",children:e.jsxs(y,{to:`/category/${i._id}`,className:"flex justify-center gap-4 items-center dropdown-item  ",children:[e.jsx("h3",{className:"text-gray-400",children:i.categoryName}),d===i._id&&e.jsx("button",{onClick:j=>{j.preventDefault(),j.stopPropagation(),n(i._id,"category")},className:"flex items-center",children:e.jsx(g,{icon:M,className:"delete-step text-lg "})})]})},i._id))})]})}function J({onAddItem:s,entityType:a,onClose:l}){const[r,x]=f.useState({name:""}),[t,c]=f.useState(""),{categories:p}=v(d=>d.tasks),h=()=>(c(""),r.name.length>10?(c("Category and tag cannot be more than 10 characters"),!1):a==="category"&&p.length>=3?(c("Category has maxed at 3 !!!"),!1):!0),b=d=>{const{value:n}=d.target;x({name:n})},o=async d=>{if(d.key==="Enter"&&r.name.trim()!==""){if(d.preventDefault(),!h())return;try{let n;a==="category"&&(n=await I({categoryName:r.name})),n?(console.log("Successfully created:",n),s(n)):console.error("No response received:",t)}catch(n){console.error(`Cannot create ${a}:`,n.message),c(`Cannot create ${a}`)}}};return e.jsx(e.Fragment,{children:e.jsx(w,{children:e.jsx("div",{className:"bg-purpleGradient p-1 rounded-xl md:w-[450px] relative",children:e.jsxs("div",{className:"bg-purpleSidebar p-8 rounded-xl",children:[e.jsxs("p",{className:"text-2xl md:text-3xl text-white",children:["Create a new ",a]}),t&&e.jsx("p",{className:"text-xl text-rose-500",children:t}),e.jsx(P,{type:"text",placeholder:`Enter ${a}`,value:r.name,onChange:b,onKeyDown:o,className:"w-full placeholder:text-xl px-4 py-3 rounded-xl my-6"}),e.jsx("button",{onClick:o,className:"done-button mx-auto",children:"Create"}),e.jsx("button",{className:"cancel-button absolute -top-5 -right-5",onClick:l,children:"X"})]})})})})}function Q(){const s=k(),a=R(),[l,r]=f.useState(!1),x=async()=>{try{const t=await s(F()).unwrap();N.remove("accessToken",{path:"/"}),N.remove("refreshToken",{path:"/"}),localStorage.clear(),s(T()),s(D()),a("/")}catch(t){console.error("Logout failed:",t),alert("Logout failed. Please try again.")}};return e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:()=>r(!0),className:" flex red-button mx-14 gap-4 items-center logout text-2xl   ",children:[e.jsx(g,{icon:$,className:" text-xl"}),"Log out"]}),l&&S.createPortal(e.jsx("div",{className:"popup-overlay",children:e.jsx(w,{children:e.jsxs("div",{className:"popup-content border-4 p-8 rounded-xl border-purpleNormal bg-purpleSidebar",children:[e.jsx("p",{className:"text-2xl text-white",children:"Are you sure you want to logout ?"}),e.jsxs("div",{className:"flex justify-center gap-4 mt-6",children:[e.jsx("button",{className:"text-deadlineTheme border-deadlineTheme text-2xl border-2 p-4 rounded-xl hover:bg-deadlineTheme hover:text-white",onClick:x,children:"Logout"}),e.jsx("button",{className:"opacity-50 text-violet-400 border-violet-400 text-2xl border-2 p-4 rounded-xl hover:bg-violet-400 hover:text-white",onClick:()=>r(!1),children:"Cancel"})]})]})})}),document.body)]})}function te(){const s=G(),a=k(),{activeMenu:l,isHover:r,isPopup:x,isSidebarPinned:t,popupMode:c,categories:p}=v(u=>u.tasks),h=v(u=>u.user.isAuthenticated),{handleRemovedItem:b,handleActiveMenu:o,handlePopup:d,handleHover:n,handleClose:i,popupEnRef:j,sidebarRef:A}=_(),E=async u=>{c==="category"&&(a(W([...p,u])),await a(C()).unwrap()),a(Y(""))};f.useEffect(()=>{a(C())},[a]),f.useEffect(()=>{a(B(s.pathname))},[s.pathname,a]);const L=()=>{a(z())};return e.jsxs("div",{id:"side-bar",className:` md:translate-x-0  md:flex flex-col gap-4 ${t?"":"-translate-x-20 sidebar-collapsed"} transition-width duration-300`,children:[e.jsxs("div",{className:`items-center gap-4 ${t?"pin-button text-white":"pin-button text-white opacity-50 hover:opacity-100 "}`,ref:A,onClick:L,children:[e.jsx("div",{className:`h-2 w-full  md:bg-purpleActive rounded-full ${t?"opacity-100":"opacity-0"} transition-opacity duration-300`}),e.jsx(g,{icon:O,className:`  hidden md:block transform origin-center text-3xl ${t?"rotate-180":"pr-4"} `})]}),e.jsx(m,{to:"/",icon:U,label:"OVERVIEW",activeMenu:l,handleActiveMenu:()=>{t&&o()},isSidebarPinned:t}),e.jsx(m,{to:"/upcoming",icon:H,label:"UPCOMING",activeMenu:l,handleActiveMenu:()=>{t&&o()},isSidebarPinned:t}),e.jsx(m,{to:"/all-tasks",icon:K,label:"ALL TASKS",activeMenu:l,handleActiveMenu:()=>{t&&o()},isSidebarPinned:t}),e.jsx(m,{to:"/category",icon:V,addIcon:X,label:"CATEGORY",categories:p,activeMenu:l,handleActiveMenu:()=>{t&&o()},handlePopup:u=>d(u,"category"),isSidebarPinned:t,handleHover:n,isHover:r,handleRemovedItem:u=>b(u,"category")}),e.jsx(m,{to:"/settings",icon:q,label:"SETTINGS",activeMenu:l,handleActiveMenu:()=>{t&&o()},isSidebarPinned:t}),h&&t&&e.jsx(Q,{}),x&&S.createPortal(e.jsx("div",{className:"popup-overlay",children:e.jsx("div",{className:"popup-content",ref:j,children:e.jsx(J,{onAddItem:E,entityType:c,onClose:i})})}),document.body)]})}export{te as default};