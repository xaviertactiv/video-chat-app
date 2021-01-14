/* Re-format the URL parameters for
 * readbility
 */
export function urlsafe(url: string, ...params) {
    return url.concat(params.join('/'), '/');
}

/* Transform dict (obj) data into string object
 * format.
 */
export function queryparams(data: object) {
  const params = Object.keys(data)
    .map((key) => {
        return `${key}=${encodeURIComponent(data[key])}`;
    })
    .join('&')
  ;
  return `?${params}`;
}
