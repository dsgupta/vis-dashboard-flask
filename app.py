import json

from flask import Flask, render_template, request, redirect, Response, jsonify
import pandas as pd
import numpy as np
from scipy.spatial.distance import cdist
from sklearn.cluster import KMeans
import math
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.metrics import pairwise_distances
from sklearn.manifold import MDS

#First of all you have to import it from the flask module:
app = Flask(__name__)

scaled = [[]]*3
feats = [[]]*3
scree = [[]]*3
projected = [[]]*3
mds1 = [[]]*3
mds2 = [[]]*3
feat_names = [[]]*3
loaded = [[]]*3

default = None

def getScree(data):

    pca = PCA(n_components=data.shape[1]).fit(data)
    y_vals = np.cumsum(pca.explained_variance_ratio_)
    scree = pd.DataFrame({"x":list(range(1,data.shape[1]+1)), "y":y_vals, "y2":pca.explained_variance_ratio_})

    feature_imp = getMaxPCALoadings(5,pca)
    features = []
    for i in np.argsort(feature_imp)[::-1]:
        features.append(data.columns[i])

    feature_imp.sort(reverse=True)
    feature_values = pd.DataFrame({"feature":features, "value":feature_imp})
    print("Computed scree!", scree)
    top_feats = features[:3]
    return (scree, feature_values, top_feats)

def getPCA2(data):
    data_pc2 = PCA(n_components=2).fit_transform(data)
    pc2 = pd.DataFrame({"x":data_pc2[:,0], "y":data_pc2[:,1]})
    return pc2

def getMaxPCALoadings(num_c, pca):

    components = np.sum(pca.components_[:num_c,:]**2, axis=0)
    feature_imp = []
    for i in range(pca.components_.shape[1]):
        feature_imp.append(components[i])
    return feature_imp

def getMDS(data, i):

    global mds1, mds2

    D2 = pairwise_distances(data, metric='correlation')
    D1 = pairwise_distances(data, metric='euclidean')
    model = MDS(n_components=2, dissimilarity='precomputed', random_state=1)
    out1 = model.fit_transform(D1)
    out2 = model.fit_transform(D2)
    mds1[i] = pd.DataFrame({"x":out1[:,0], "y":out1[:, 1]})
    mds2[i] = pd.DataFrame({"x":out2[:,0], "y":out2[:, 1]})
    return (mds1, mds2)



def scatterType(button):

    global projected, mds1, mds2, loaded
    i = int(button[0])
    buttons = button.split("_")

    if len(buttons)==1 or buttons[1] == "PCA":
        chart_data = projected[i].to_dict(orient='records')
    elif buttons[1] == "mdsE":
        chart_data = mds1[i].to_dict(orient='records')
    elif buttons[1] == "mdsC":
        chart_data = mds2[i].to_dict(orient='records')
    elif buttons[1] == "matrix":
        chart_data = loaded[i].to_dict(orient='records')
    return chart_data



#By default, a route only answers to GET requests. You can use the methods argument of the route() decorator to handle different HTTP methods.
@app.route("/", methods = ['POST', 'GET'])
def index():
    #df = pd.read_csv('data.csv').drop('Open', axis=1)
    print("INDEX!")
    global scaled
    global feats
    global scree
    global projected
    global elbow
    #The current request method is available by using the method attribute
    if request.method == 'POST':
        pass
        # if request.form['data'] == 'received':
        # data = df[['date','open']]
        #print("POST!")
        buttonVal =  request.form.get('function')
        # chart_data = None
        # #print("BUTTON VAL: ", buttonVal)
        # if buttonVal.endswith("Scree"):
        #     #print("Got feat names", feat_names[int(buttonVal[0])])
        #     chart_data = scree[int(buttonVal[0])].to_dict(orient='records')
        # elif buttonVal.endswith("Feats"):
        #     chart_data = feats[int(buttonVal[0])].to_dict(orient='records')
        # elif "Scatter" in buttonVal:
        #     chart_data = scatterType(buttonVal)
        #
        # print("After to_dict: ", chart_data)
        # chart_data = json.dumps(chart_data, indent=2)
        # data = {'chart_data': chart_data}
        # print("Json dumps result: ", chart_data)
        # print("What is data? ", data)
        # print(jsonify(data))
        # return jsonify(data) # Should be a json string
        if buttonVal == "slider":
            data = default
            chart_data = data.to_dict(orient='records')
            print("CHART DATA AFTER TO DICT", chart_data)
            chart_data = json.dumps(chart_data, indent=2)
            data = {'chart_data': chart_data}
            return jsonify(data)


    else:
        data = default
        chart_data = data.to_dict(orient='records')
        # print("CHART DATA AFTER TO DICT", chart_data)
        chart_data = json.dumps(chart_data, indent=2)
        data = {'chart_data': chart_data}
        return render_template("index.html", data=data)

# @app.route("/member", methods = ['POST', 'GET'])
# def index():
    ###
elbow = None
def getData():

    data = pd.read_csv(r'inequality_data.csv')
    # random = data.sample(frac=0.5, random_state=1)
    # X = data.values
    # k, elbow = getNumK(X)
    # print(k, elbow)
    # cols = data.columns
    # data['cluster'] = KMeans(n_clusters=k).fit_predict(X)
    # stratified = data.groupby('cluster').apply(lambda x: x.sample(frac=0.5, random_state=1))
    # data_scale = pd.DataFrame(MinMaxScaler().fit_transform(X), columns = cols)
    # random_scale = pd.DataFrame(MinMaxScaler().fit_transform(random), columns = cols)
    # strat_scale = pd.DataFrame(MinMaxScaler().fit_transform(stratified.drop('cluster', axis=1)), columns = cols)
    # return (data_scale, random_scale, strat_scale, elbow)
    return data[['Entity', 'Code', 'Year', 'gdp_per_capita']].dropna()

def getNumK(X):

    res = []
    n_cluster = range(2,21)
    for n in n_cluster:
        kmeans = KMeans(n_clusters=n)
        kmeans.fit(X)
        res.append(np.mean(np.min(cdist(X, kmeans.cluster_centers_, 'euclidean'), axis=1)))

    elbow = pd.DataFrame({"x":list(n_cluster), "y":res})
    print(elbow)
    return (7, elbow)

if __name__ == "__main__":

    # data_scale, random_scale, strat_scale, elbow = getData()
    default = getData()
    # scaled[0] = data_scale
    # scaled[1] = random_scale
    # scaled[2] = strat_scale
    # #print(data_scale[:20,:])
    # for i in range(3):
    #     getMDS(scaled[i], i)
    # for i in range(3):
    #     scree[i], feats[i], feat_names[i]= getScree(scaled[i])
    # for i in range(3):
    #     projected[i] = getPCA2(scaled[i])
    # for i in range(3):
    #     loaded[i] = scaled[i][feat_names[i]]
    # print("ORIGINAL! SCREE!", scree)
    #print(jsonify(elbow))
    app.config["CACHE_TYPE"] = "null"
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    app.run(debug=True)
