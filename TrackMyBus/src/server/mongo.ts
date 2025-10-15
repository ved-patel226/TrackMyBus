import { MongoClient, Db } from 'mongodb';

export class MongoDB {
    private client: MongoClient;
    public db: Db;

    constructor(private uri: string, private dbName: string) {
        this.client = new MongoClient(this.uri);

        this.client.connect().then(() => {
            this.db = this.client.db(this.dbName);
            console.log('Connected to MongoDB');
        }).catch((err) => {
            console.error('Failed to connect to MongoDB', err);
        });
    }



    async disconnect(): Promise<void> {
        await this.client.close();
    }
}