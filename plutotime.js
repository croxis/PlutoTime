// The following code is taken from the nasa website:
// http://solarsystem.nasa.gov/planets/pluto/plutotime
//

const target_angle = -1.5;
const eccent_earth_orbit = 0.0167042317652;
const sin_obliq_corr = 0.397764267077;
const var_y = 0.0430314896879;

var latitude, longitude;

function get_jd() {
    var d = new Date();
    var unix = d.getTime()*1e-3;
    return (unix/86400.)+2440587.5;
}

function get_date(jd) {
    var d = new Date();
    d.setTime( (jd-2440587.5)*86400.*1000. );
    return d;
}

function solar_elevation(julian_date) {
    var latitude_r = latitude*Math.PI/180.;
    var longitude_r = longitude*Math.PI/180.;
    
    var time_ut = (julian_date-0.5)-Math.floor(julian_date-0.5);
    var julian_century = (julian_date-2451545)/36525.;
    var geom_mean_long_sun = (280.46646+julian_century*(36000.76983+julian_century*0.0003032)) % 360;
    var gmls_r = geom_mean_long_sun*Math.PI/180.;
    var geom_mean_anom_sun = 357.52911+julian_century*(35999.05029-0.0001537*julian_century);
    var gmas_r = geom_mean_anom_sun*Math.PI/180.;
    var sun_eq_of_ctr_r = ( Math.sin(gmas_r)*(1.914602-julian_century*
    (0.004817+0.000014*julian_century))+Math.sin(2*gmas_r)*
    (0.019993-0.000101*julian_century)+Math.sin(3*gmas_r)*0.000289)*Math.PI/180.;
    var sun_app_long_r = gmls_r + sun_eq_of_ctr_r;
    var sun_declin_r = Math.asin(sin_obliq_corr*Math.sin(sun_app_long_r));
    var eq_of_time = 4*(180./Math.PI)*(var_y*Math.sin(2*gmls_r)
    -2*eccent_earth_orbit*Math.sin(gmas_r)
    +4*eccent_earth_orbit*var_y*Math.sin(gmas_r)*Math.cos(2*gmls_r)
    -0.5*var_y*var_y*Math.sin(4*gmls_r)
    -1.25*eccent_earth_orbit*eccent_earth_orbit*Math.sin(2*gmas_r));
    var true_solar_time = ((time_ut*1440+eq_of_time+4*longitude) % 1440)*Math.PI/180.;
    var hour_angle, atmo;
    if(true_solar_time<0) { hour_angle = true_solar_time/4 + Math.PI; }
    else{ hour_angle = true_solar_time/4 - Math.PI; }
    var solar_zenith_angle = (Math.acos(Math.sin(latitude_r)*Math.sin(sun_declin_r)
    +Math.cos(latitude_r)*Math.cos(sun_declin_r)*Math.cos(hour_angle)));
    var solar_elevation_angle = (Math.PI/2)-solar_zenith_angle;
    var tane = Math.tan(solar_elevation_angle);
    var W2 = solar_elevation_angle*180./Math.PI;
    if(W2>85) {atmo = 0;}
    else if(W2>5) {atmo = (58.1/tane-0.07/Math.pow(tane,3)+0.000086/Math.pow(tane,5));}
    else if(W2>-0.575) {atmo = 1735+W2*(-518.2+W2*(103.4+W2*(-12.79+W2*0.711)));}
    else {atmo = -20.772/tane;}
    return solar_elevation_angle*180./Math.PI + atmo/3600.;
}

// Uses bisection method to find next JD when solar elevation angle is at target
function find_time(julian_date) {
    var b = 1.0*julian_date;
    if (solar_elevation(julian_date) <= target_angle){
        while(solar_elevation(b + 0.000115741) <= target_angle){
            b += 0.000115741;
        }
    }
    else {
        while(solar_elevation(b + 0.000115741) > target_angle){
            b += 0.000115741;
        }
    }
    return b;
}

function make_text(ele,next,jd) {
    const mindt = 5./(60.*24.);
    var ret = "";
    var dt = next - jd;
    if(dt <= mindt) {
        ret += "<p>It's Pluto Time now!";
    } else {
        var tnext = format_next(dt);
        var suns = (ele > target_angle)?"After sunset":"Before sunrise";
        var dnext = format_date(next);
        //ret += "<div align=\"center\"><div style=\"font-size:24px; padding-top: 40px;\"><b>Your next Pluto time will be:</b></div><div style=\"color: #d7a02c; padding-top: 24px;\"><b>"+suns+" on "+dnext+"</b>*<br>("+tnext+" away)</div><div style=\"font-size: 14px; padding-top: 40px;\">* based on your computer's clock</div></div>";
        //Removing custom formatting until I put it as config options
        ret += "<div style=\"font-size:18px;\"><b>"+suns+" on "+dnext+"</b><br>("+tnext+" away)</div>";
    }
    ret += "<span style=\"font-size: 14px;\">Current Solar Elevation Angle: "+(ele*1.).toFixed(1)+" degrees</span>";
    //ret += "<br><span style=\"font-size: 12px; color: #000000;\">(This is how high the sun is above the horizon; negative elevation means the Sun is below the horizon.)</span>";
    return ret;
}

function format_next(dd) {
    var d = Math.floor(dd);
    var hh = (dd-d)*24.;
    var h = Math.floor(hh);
    var mm = (hh-h)*60.;
    var m = Math.floor(mm);
    if(m>59) { m=0; h+=1; }
    var ret = "";
    if(d>0) { ret += d+" days, "; }
    if(h>0) { ret += h+" hours, "; }
    ret += m+" minutes"; 
    return ret;
}

function format_date(jd) {
    var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    var n = get_date(jd);
    var min = Math.floor(n.getMinutes());
    if(min<10) { min = "0"+min; }
    if(min>59) { min = "00"; off = 1; }
    else { off = 0; }
    var hr = off+n.getHours();
    if(hr>12) {
    hr -= 12;
    ap = "PM";
    } else { ap = "AM"; }
    var tz = n.toString().split(" ")[6].replace("(","").replace(")","");
    ret = monthNames[n.getMonth()]+" "+n.getDate()+" at "+hr+":"+min+" "+ap+" "+tz;
    return ret;
}
//
// End NASA code
//

Module.register("plutotime", {
    defaults: {
        latitude: 34.2,
        longitude: -118.1
    },
    // Override dom generator.
    getDom: function() {
        latitude = this.config.latitude;
        longitude = this.config.longitude;
        var julian_date = get_jd();
        var sun_elevation = solar_elevation(julian_date);
        var next = find_time(julian_date);
        var wrapper = document.createElement("div");
        // The following is modified from make_test to fit the dom wrapper
        const mindt = 5./(60.*24.);
        var small = document.createElement("div");
        small.className = "normal medium";
        var dt = next - julian_date;
        if(dt <= mindt) {
            small.innerHTML = "It's Pluto Time now!"
        } else {
            var tnext = format_next(dt);
            var suns = (sun_elevation > target_angle)?"After sunset":"Before sunrise";
            var dnext = format_date(next);
            small.innerHTML = "<div style=\"font-size:18px; LINE-HEIGHT:20px;\">"+suns+" on "+dnext+"<br>("+tnext+" away)</div>";
        }
        small.innerHTML += "<span style=\"font-size: 14px;\">Current Solar Elevation Angle: "+(sun_elevation*1.).toFixed(1)+" degrees</span>";
        wrapper.appendChild(small);
        //wrapper.innerHTML = make_text(sun_elevation, next, julian_date);
        return wrapper;
    }
});