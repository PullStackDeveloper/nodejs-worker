import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    console.log(`Master ${process.pid} is running`);
    console.log(`Forking ${numCPUs} workers...`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid}`);
    })
} else {
    require('./server');
    console.log(`Worker ${process.pid} started`);
}