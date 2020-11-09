<a name="KoaGenericHandle"></a>

## KoaGenericHandle
<p>Handle API requests and errors in Koa apps in a standard way.</p>

**Kind**: global class  

* [KoaGenericHandle](#KoaGenericHandle)
    * [.tracking(options)](#KoaGenericHandle.tracking)
    * [.poweredBy(powered_by)](#KoaGenericHandle.poweredBy)
    * [.logging(options)](#KoaGenericHandle.logging)


* * *

<a name="KoaGenericHandle.tracking"></a>

### KoaGenericHandle.tracking(options)
<p><code>.tracking</code> provides a request and transaction ID's and a response time header.
Attaches <code>request_id</code>, <code>trasaction_id</code>, <code>request_start</code>, <code>request_total</code>, to <code>ctx.state</code></p>

**Kind**: static method of [<code>KoaGenericHandle</code>](#KoaGenericHandle)  
**Summary**: <p>Request tracking</p>  
**Descrtracking**:   

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | <p>The options for the logger</p> |
| options.transaction_trust | <code>boolean</code> \| <code>string</code> | <p>Trust the clients <code>x-transaction-id</code> header. (true/false/'ip')</p> |
| options.transaction_trust_ips | <code>array</code> | <p>List of IP's to trust the clients <code>x-transaction-id</code> header from. e.g. localhosts are <code>['::ffff:127.0.0.1', '127.0.0.1', '::1']</code></p> |


* * *

<a name="KoaGenericHandle.poweredBy"></a>

### KoaGenericHandle.poweredBy(powered_by)
<p><code>.poweredBy</code> sets the x-powered-by header to something other than koa.</p>

**Kind**: static method of [<code>KoaGenericHandle</code>](#KoaGenericHandle)  
**Summary**: <p>Powered by heade</p>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| powered_by | <code>string</code> | <code>&quot;handles&quot;</code> | <p>The string to set it to</p> |


* * *

<a name="KoaGenericHandle.logging"></a>

### KoaGenericHandle.logging(options)
<p><code>.logging</code> attached a pino log instance to ctx.</p>

**Kind**: static method of [<code>KoaGenericHandle</code>](#KoaGenericHandle)  
**Summary**: <p>Logging via pino</p>  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | <p>Options object</p> |
| options.logger | <code>object</code> | <p>A pino instance to inject</p> |
| options.log_level | <code>object</code> | <p>The log level to use for requests</p> |


* * *

