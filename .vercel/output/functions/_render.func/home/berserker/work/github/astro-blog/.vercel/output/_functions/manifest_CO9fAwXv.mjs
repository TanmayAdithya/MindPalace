import 'cookie';
import { bold, red, yellow, dim, blue } from 'kleur/colors';
import './chunks/astro_1EME-aGG.mjs';
import 'clsx';
import { compile } from 'path-to-regexp';

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return red(prefix.join(" "));
  }
  if (level === "warn") {
    return yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return dim(prefix[0]);
  }
  return dim(prefix[0]) + " " + blue(prefix.splice(1).join(" "));
}
if (typeof process !== "undefined") {
  let proc = process;
  if ("argv" in proc && Array.isArray(proc.argv)) {
    if (proc.argv.includes("--verbose")) ; else if (proc.argv.includes("--silent")) ; else ;
  }
}
class Logger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
}

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return (params) => {
    const path = toPath(params);
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware(_, next) {
      return next();
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes
  };
}

const manifest = deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.BqQZnxCO.css"}],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.BqQZnxCO.css"}],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/search.json","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/search\\.json\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"search.json","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/search.json.ts","pathname":"/api/search.json","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.BqQZnxCO.css"}],"routeData":{"route":"/articles/search","isIndex":false,"type":"page","pattern":"^\\/articles\\/search\\/?$","segments":[[{"content":"articles","dynamic":false,"spread":false}],[{"content":"search","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/articles/search.astro","pathname":"/articles/search","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.BqQZnxCO.css"}],"routeData":{"route":"/articles/tag/[...tag]","isIndex":false,"type":"page","pattern":"^\\/articles\\/tag(?:\\/(.*?))?\\/?$","segments":[[{"content":"articles","dynamic":false,"spread":false}],[{"content":"tag","dynamic":false,"spread":false}],[{"content":"...tag","dynamic":true,"spread":true}]],"params":["...tag"],"component":"src/pages/articles/tag/[...tag].astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.BqQZnxCO.css"}],"routeData":{"route":"/articles","isIndex":true,"type":"page","pattern":"^\\/articles\\/?$","segments":[[{"content":"articles","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/articles/index.astro","pathname":"/articles","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.BqQZnxCO.css"},{"type":"inline","content":"p{margin:20px 0}h2{margin:20px 0;font-size:1.8rem}\n"}],"routeData":{"route":"/articles/[...slug]","isIndex":false,"type":"page","pattern":"^\\/articles(?:\\/(.*?))?\\/?$","segments":[[{"content":"articles","dynamic":false,"spread":false}],[{"content":"...slug","dynamic":true,"spread":true}]],"params":["...slug"],"component":"src/pages/articles/[...slug].astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/about.BqQZnxCO.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/home/berserker/work/github/astro-blog/src/components/Footer.astro",{"propagation":"in-tree","containsHead":false}],["/home/berserker/work/github/astro-blog/src/layouts/MainLayout.astro",{"propagation":"in-tree","containsHead":false}],["/home/berserker/work/github/astro-blog/src/pages/404.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/404@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["/home/berserker/work/github/astro-blog/src/pages/about.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/about@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/berserker/work/github/astro-blog/src/pages/articles/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/articles/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/berserker/work/github/astro-blog/src/pages/articles/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/articles/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/berserker/work/github/astro-blog/src/pages/articles/search.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/articles/search@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/berserker/work/github/astro-blog/src/pages/articles/tag/[...tag].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/articles/tag/[...tag]@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/berserker/work/github/astro-blog/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/berserker/work/github/astro-blog/src/pages/api/search.json.ts",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/api/search.json@_@ts",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000noop-middleware":"_noop-middleware.mjs","/src/pages/about.astro":"chunks/pages/about_DfrhQZTU.mjs","/node_modules/astro/dist/assets/endpoint/generic.js":"chunks/pages/generic_3R0ZQDQU.mjs","/src/pages/articles/search.astro":"chunks/pages/search_C9y2Cgxa.mjs","/src/pages/api/search.json.ts":"chunks/pages/search_D5nzzyH2.mjs","\u0000@astrojs-manifest":"manifest_CO9fAwXv.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"chunks/generic_C3qzJ6qh.mjs","\u0000@astro-page:src/pages/404@_@astro":"chunks/404_ByN-CXrx.mjs","\u0000@astro-page:src/pages/about@_@astro":"chunks/about_-DconAxz.mjs","\u0000@astro-page:src/pages/api/search.json@_@ts":"chunks/search_B88jpvHF.mjs","\u0000@astro-page:src/pages/articles/search@_@astro":"chunks/search_CX6cY4Qb.mjs","\u0000@astro-page:src/pages/articles/tag/[...tag]@_@astro":"chunks/_.._BeJBhfdq.mjs","\u0000@astro-page:src/pages/articles/index@_@astro":"chunks/index_mxvOpuOZ.mjs","\u0000@astro-page:src/pages/articles/[...slug]@_@astro":"chunks/_.._CyI3xayY.mjs","\u0000@astro-page:src/pages/index@_@astro":"chunks/index_U5OwTs06.mjs","/home/berserker/work/github/astro-blog/src/content/blog/best-laptops-for-developers.md?astroContentCollectionEntry=true":"chunks/best-laptops-for-developers_yQ7SGR5k.mjs","/home/berserker/work/github/astro-blog/src/content/blog/cannon-excellence.md?astroContentCollectionEntry=true":"chunks/cannon-excellence_BpfuoHtf.mjs","/home/berserker/work/github/astro-blog/src/content/blog/cutting-edge-tablets.md?astroContentCollectionEntry=true":"chunks/cutting-edge-tablets_PKhCN1_1.mjs","/home/berserker/work/github/astro-blog/src/content/blog/elevate-your-mobile-experience.md?astroContentCollectionEntry=true":"chunks/elevate-your-mobile-experience_C7VCvM6C.mjs","/home/berserker/work/github/astro-blog/src/content/blog/guardian-of-the-digital-realm.md?astroContentCollectionEntry=true":"chunks/guardian-of-the-digital-realm_BxqxbYYH.mjs","/home/berserker/work/github/astro-blog/src/content/blog/immerse-in-the-virtual-world.md?astroContentCollectionEntry=true":"chunks/immerse-in-the-virtual-world_Rj5tUbDe.mjs","/home/berserker/work/github/astro-blog/src/content/blog/world-of-drones.md?astroContentCollectionEntry=true":"chunks/world-of-drones_BqnQ5rO9.mjs","/home/berserker/work/github/astro-blog/src/content/blog/best-laptops-for-developers.md?astroPropagatedAssets":"chunks/best-laptops-for-developers_D51hrBfL.mjs","/home/berserker/work/github/astro-blog/src/content/blog/cannon-excellence.md?astroPropagatedAssets":"chunks/cannon-excellence_DarZBMmY.mjs","/home/berserker/work/github/astro-blog/src/content/blog/cutting-edge-tablets.md?astroPropagatedAssets":"chunks/cutting-edge-tablets_CBMmvvV7.mjs","/home/berserker/work/github/astro-blog/src/content/blog/elevate-your-mobile-experience.md?astroPropagatedAssets":"chunks/elevate-your-mobile-experience_B2pckDVr.mjs","/home/berserker/work/github/astro-blog/src/content/blog/guardian-of-the-digital-realm.md?astroPropagatedAssets":"chunks/guardian-of-the-digital-realm_CUJrNfee.mjs","/home/berserker/work/github/astro-blog/src/content/blog/immerse-in-the-virtual-world.md?astroPropagatedAssets":"chunks/immerse-in-the-virtual-world_CqrOKRWE.mjs","/home/berserker/work/github/astro-blog/src/content/blog/world-of-drones.md?astroPropagatedAssets":"chunks/world-of-drones_B3Y41Hlp.mjs","/home/berserker/work/github/astro-blog/src/content/blog/best-laptops-for-developers.md":"chunks/best-laptops-for-developers_D83x8IBm.mjs","/home/berserker/work/github/astro-blog/src/content/blog/cannon-excellence.md":"chunks/cannon-excellence_KPyP07uS.mjs","/home/berserker/work/github/astro-blog/src/content/blog/cutting-edge-tablets.md":"chunks/cutting-edge-tablets_DewzQJUp.mjs","/home/berserker/work/github/astro-blog/src/content/blog/elevate-your-mobile-experience.md":"chunks/elevate-your-mobile-experience_BpoMEA6k.mjs","/home/berserker/work/github/astro-blog/src/content/blog/guardian-of-the-digital-realm.md":"chunks/guardian-of-the-digital-realm_BgxGTPIc.mjs","/home/berserker/work/github/astro-blog/src/content/blog/immerse-in-the-virtual-world.md":"chunks/immerse-in-the-virtual-world_Dh_8SEPQ.mjs","/home/berserker/work/github/astro-blog/src/content/blog/world-of-drones.md":"chunks/world-of-drones_2oR0Qyou.mjs","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/team1.CHXq7Isr.png","/_astro/error-404.Ox42KQdE.png","/_astro/team2.Ccx9qtIf.png","/_astro/team3.B0njnFun.png","/_astro/about.C1FZ3Rbp.jpg","/_astro/about.BqQZnxCO.css","/favicon.svg","/images/image1.png","/images/image2.png","/images/image3.png","/images/image4.png","/images/image5.png","/images/image6.png","/images/image7.png"],"buildFormat":"directory","checkOrigin":false});

export { AstroIntegrationLogger as A, Logger as L, getEventPrefix as g, levels as l, manifest };
